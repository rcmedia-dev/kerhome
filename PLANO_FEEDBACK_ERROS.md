# Plano de Acção - Feature de Feedback de Erros

## 1. Contexto e Problema

O KerHome é uma plataforma imobiliária Next.js 15 + Supabase que utiliza extensivamente `toast.error()` da lib **Sonner** para mostrar erros aos utilizadores. Actualmente existem **+155 ocorrências** de `toast.error()` espalhadas por toda a aplicação.

**Problema**: Quando um erro aparece, o utilizador não tem forma de o reportar à equipa de desenvolvimento. O toast desaparece automaticamente e o contexto do erro é perdido para sempre.

**Objectivo**: Implementar um mecanismo de feedback onde o utilizador pode, a qualquer momento, reportar um erro que encontrou, enviando automaticamente contexto técnico relevante para a equipa de desenvolvimento.

---

## 2. Análise do Estado Actual

### 2.1 Error Handling Existente

| Componente | Localização | Estado |
|------------|-------------|--------|
| `ErrorBoundary` | `src/components/error-boundary.tsx` | Captura erros React, mostra fallback genérico sem opção de reportar |
| `ErrorState` | `src/components/error-state.tsx` | Mostra erro de carregamento com botão retry, sem report |
| `error/page.tsx` | `src/app/error/page.tsx` | Página de erro básica, apenas texto |
| `toast.error()` | +155 ficheiros | Erros mostrados via Sonner, desaparecem após ~5s |

### 2.2 Stack Tecnológica Relevante

- **Framework**: Next.js 15.3.8 (App Router)
- **UI**: React 19, TailwindCSS 4, Radix UI, Lucide Icons
- **Estado**: Zustand
- **Toasts**: Sonner (`src/components/ui/sonner.tsx`)
- **Base de Dados**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Email**: Resend

### 2.3 Estrutura da Base de Dados Actual

Tabelas existentes relevantes:
- `notifications` - notificações in-app (pode ser utilizada para notificar admins)
- `user_events` - tracking de interações (pode ser estendida ou servir de referência)
- `profiles` - dados do utilizador com campo `role`

---

## 3. Arquitectura da Feature

### 3.1 Componentes a Criar

#### 3.1.1 `src/components/error-feedback-dialog.tsx` (PRINCIPAL)

Dialog/modal que aparece quando o utilizador clica no botão de reportar erro.

**Props:**
```typescript
interface ErrorFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorInfo?: {
    message?: string;        // Mensagem do erro
    stack?: string;          // Stack trace se disponível
    componentStack?: string; // Stack do componente React
    url?: string;            // URL onde ocorreu
    timestamp?: string;      // Quando ocorreu
  };
}
```

**Funcionalidades:**
- Campo de texto para o utilizador descrever o que estava a fazer
- Campo de seleção de severidade (Baixa/Média/Alta/Crítica)
- **Upload de imagem opcional** (screenshot do erro)
- Checkbox "Incluir informações técnicas" (marcado por defecto)
- Captura automática: URL, user agent, timestamp, utilizador logado
- Botão de submeter com estado de loading
- Feedback de sucesso após submissão

**Upload de Imagem (Opcional):**
- Botão "Anexar Screenshot" com ícone de câmara
- Aceita apenas imagens (JPG, PNG, WebP)
- Máximo: 5MB por imagem, máximo 3 imagens
- Preview das imagens antes de submeter
- Opção de remover cada imagem individualmente
- Upload para Supabase Storage bucket `error-feedbacks`
- Armazenar URLs das imagens no campo `screenshots` (JSONB array)

#### 3.1.2 `src/components/error-feedback-trigger.tsx`

Componente que pode ser injectado em qualquer `toast.error()` para adicionar um botão de reportar.

**Funcionalidades:**
- Renderiza um botão pequeno "Reportar" dentro do toast
- Ao clicar, abre o `ErrorFeedbackDialog`
- Captura o contexto do erro automaticamente

#### 3.1.3 `src/lib/error-feedback.ts`

Utilitário centralizado para o sistema de feedback.

**Funções:**
```typescript
// Função principal para mostrar toast com opção de reportar
export function toastErrorWithFeedback(message: string, error?: Error, options?: ToastOptions): void;

// Função para submeter feedback
export function submitErrorFeedback(feedback: ErrorFeedbackPayload): Promise<void>;

// Função para obter contexto do erro
export function getErrorContext(error?: Error): ErrorContext;
```

#### 3.1.4 `src/hooks/use-error-feedback.ts`

Hook React para gerir o estado do feedback.

```typescript
export function use-error-feedback() {
  return {
    reportError: (error?: Error, context?: string) => void;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
  };
}
```

### 3.2 API Route

#### `src/app/api/feedback/route.ts`

Endpoint para receber e guardar o feedback de erros.

**Método POST (FormData para suportar imagens):**
```typescript
interface FeedbackRequest {
  message: string;           // Descrição do utilizador
  severity: 'low' | 'medium' | 'high' | 'critical';
  error_message?: string;    // Mensagem do erro técnico
  error_stack?: string;      // Stack trace
  component_stack?: string;  // React component stack
  url: string;               // URL onde ocorreu
  user_agent: string;        // Browser/OS
  user_id?: string;          // ID do utilizador se logado
  user_email?: string;       // Email do utilizador
  include_tech_info: boolean;
  screenshots?: File[];      // Imagens opcionais (max 3, 5MB cada)
  metadata: Record<string, any>; // Dados extras
}
```

**Acções:**
1. Validar dados recebidos
2. Upload das imagens para Supabase Storage (se existirem)
3. Guardar na tabela `error_feedbacks` com URLs das imagens
4. Enviar email de notificação para a equipa (via Resend)
5. Criar notificação in-app para admins
6. Retornar confirmação ao utilizador

#### `src/app/api/feedback/upload/route.ts`

Endpoint dedicado para upload de screenshots (opcional, pode ser integrado na route principal).

**Método POST:**
- Recebe FormData com ficheiro
- Valida tipo (JPG, PNG, WebP) e tamanho (max 5MB)
- Comprime imagem para optimizar armazenamento
- Upload para Supabase Storage `error-feedbacks/`
- Retorna URL pública da imagem

### 3.3 Base de Dados

#### Migration: `database/migrations/error_feedbacks_table.sql`

```sql
CREATE TABLE IF NOT EXISTS error_feedbacks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email      TEXT,
  message         TEXT NOT NULL,
  severity        TEXT NOT NULL DEFAULT 'medium' 
                    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  error_message   TEXT,
  error_stack     TEXT,
  component_stack TEXT,
  url             TEXT NOT NULL,
  user_agent      TEXT,
  include_tech_info BOOLEAN NOT NULL DEFAULT TRUE,
  screenshots     JSONB NOT NULL DEFAULT '[]',  -- Array de URLs de imagens
  metadata        JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes     TEXT,
  resolved_by     UUID REFERENCES auth.users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_user_id    ON error_feedbacks (user_id);
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_severity   ON error_feedbacks (severity);
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_status     ON error_feedbacks (status);
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_created_at ON error_feedbacks (created_at DESC);

-- RLS
ALTER TABLE error_feedbacks ENABLE ROW LEVEL SECURITY;

-- Utilizador pode ver os seus próprios feedbacks
CREATE POLICY "user_ve_seus_feedbacks"
  ON error_feedbacks
  FOR SELECT
  USING (user_id = auth.uid());

-- Qualquer pessoa pode inserir (utilizadores anónimos incluídos)
CREATE POLICY "qualquer_um_pode_inserir_feedback"
  ON error_feedbacks
  FOR INSERT
  WITH CHECK (true);

-- Admin pode ver tudo e actualizar
CREATE POLICY "admin_gera_feedbacks"
  ON error_feedbacks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
```

---

## 4. Ficheiros a Modificar

### 4.1 Modificações Existentes

| Ficheiro | Modificação |
|----------|-------------|
| `src/components/error-boundary.tsx` | Adicionar botão "Reportar Erro" no fallback |
| `src/components/error-state.tsx` | Adicionar botão "Reportar" junto ao retry |
| `src/app/error/page.tsx` | Expandir com formulário de feedback |
| `src/components/ui/sonner.tsx` | (Manter como está, usar função custom) |

### 4.2 Substituição de `toast.error()` (Fase 2)

Substituir progressivamente os ~155 `toast.error()` por `toastErrorWithFeedback()`:

**Alta Prioridade** (erros críticos de utilizador):
- `src/components/multi-step-form.tsx` - submissão de imóvel
- `src/components/chat/chat-window.tsx` - envio de mensagens
- `src/app/dashboard/editar-imovel/[id]/page.tsx` - edição de imóvel
- `src/components/dashboard/agency-team-management.tsx` - gestão de equipa
- `src/components/dashboard/messages-tab.tsx` - agendamento de visitas

**Média Prioridade** (erros de operação):
- `src/components/property-card.tsx` - favoritos
- `src/components/header.tsx` - logout
- `src/components/account-setting.tsx` - configurações

**Baixa Prioridade** (erros informativos):
- `src/components/share-button.tsx` - copiar link
- Restantes componentes

---

## 5. Fluxo da Feature

### 5.1 Fluxo Principal

```
Utilizador vê toast.error("Erro ao guardar")
        │
        ▼
Toast mostra mensagem + botão "📋 Reportar"
        │
        ▼
Utilizador clica "Reportar"
        │
        ▼
Abre ErrorFeedbackDialog
        │
        ├── Captura automática: URL, timestamp, user agent, user logado
        ├── Mostra: mensagem do erro, stack (se disponível)
        │
        ▼
Utilizador preenche:
        ├── Descrição do que estava a fazer (obrigatório)
        ├── Severidade: Baixa/Média/Alta/Crítica
        ├── "Incluir dados técnicos" (checkbox)
        │
        ▼
Clica "Enviar Feedback"
        │
        ▼
POST /api/feedback
        │
        ├── 1. Guarda em error_feedbacks
        ├── 2. Envia email para equipa (Resend)
        ├── 3. Cria notificação para admins
        │
        ▼
Toast de confirmação: "✅ Obrigado! O teu feedback foi enviado."
```

### 5.2 Fluxo no ErrorBoundary

```
Erro React é capturado pelo ErrorBoundary
        │
        ▼
Mostra fallback com:
        ├── Mensagem de erro amigável
        ├── Detalhes do erro (expandível)
        ├── Botão "Recarregar Página"
        ├── Botão "Voltar ao Início"
        └── Botão "Reportar Este Erro"  ← NOVO
        │
        ▼
Abre ErrorFeedbackDialog com contexto pré-preenchido
```

---

## 6. UI/UX Design

### 6.1 Botão nos Toasts

```
┌─────────────────────────────────────────┐
│ ⚠️ Erro ao guardar propriedade          │
│                                         │
│ 📋 Reportar Este Erro            [X]   │
└─────────────────────────────────────────┘
```

### 6.2 Dialog de Feedback

```
┌──────────────────────────────────────────────────────┐
│ 🐛 Reportar Erro                              [X]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Descreve o que estavas a fazer: *                    │
│ ┌──────────────────────────────────────────────────┐ │
│ │                                                  │ │
│ │                                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ Severidade:                                          │
│ ○ Baixa  ● Média  ○ Alta  ○ Crítica                 │
│                                                      │
│ 📷 Anexar Screenshot (opcional)                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │  + Adicionar Imagem                              │ │
│ │                                                  │ │
│ │  [preview1.png] [preview2.png]          [X] [X]  │ │
│ │                                                  │ │
│ │  Máx. 3 imagens • JPG, PNG, WebP • 5MB cada     │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ☑ Incluir informações técnicas                       │
│   (URL, navegador, timestamp)                        │
│                                                      │
│ ──────────────────────────────────────────────────── │
│ Erro detectado:                                      │
│ "TypeError: Cannot read property 'map' of undefined" │
│                                                      │
├──────────────────────────────────────────────────────┤
│                              [Cancelar] [Enviar]     │
└──────────────────────────────────────────────────────┘
```

**Preview de Imagem:**
```
┌─────────────────────┐
│                     │
│   [screenshot.png]  │
│                     │
│              [X]    │  ← botão remover
└─────────────────────┘
```

### 6.3 Design do ErrorBoundary Actualizado

```
┌──────────────────────────────────────┐
│            ⚠️ Ícone                  │
│                                      │
│      Algo deu errado                 │
│                                      │
│  Desculpe, encontramos um erro...    │
│                                      │
│  ▶ Detalhes do erro (expandível)     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Recarregar Página             │  │
│  └────────────────────────────────┘  │
│                                      │
│        Voltar ao Início              │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📋 Reportar Este Erro         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 7. Notificação para Admins

### 7.1 Email (via Resend)

Quando um feedback é submetido, enviar email para a equipa:

**Assunto:** `[KerHome Feedback] Erro reportado - Severidade: Alta`

**Corpo:**
```html
<h2>Novo Report de Erro</h2>
<p><strong>Severidade:</strong> Alta</p>
<p><strong>Utilizador:</strong> user@email.com</p>
<p><strong>URL:</strong> https://kerhome.com/propriedades/123</p>
<p><strong>Descrição:</strong> "Estava a tentar agendar uma visita e deu erro"</p>
<p><strong>Erro:</strong> TypeError: Cannot read property 'map' of undefined</p>
<p><strong>Data:</strong> 2026-07-27 14:30:00</p>
```

### 7.2 Notificação In-App

Utilizar a tabela `notifications` existente para notificar admins:

```typescript
{
  user_id: adminUserId,
  type: 'error_feedback',
  title: 'Novo Report de Erro',
  message: `Erro reportado por ${userEmail} - Severidade: ${severity}`,
  data: { feedback_id: feedbackId, severity, url }
}
```

---

## 8. Plano de Implementação

### Fase 1: Fundação (2-3 dias)

| # | Tarefa | Ficheiro |
|---|--------|----------|
| 1 | Criar migration da tabela `error_feedbacks` | `database/migrations/error_feedbacks_table.sql` |
| 2 | Criar API route `/api/feedback` | `src/app/api/feedback/route.ts` |
| 3 | Criar utilitário `error-feedback.ts` | `src/lib/error-feedback.ts` |
| 4 | Criar hook `use-error-feedback` | `src/hooks/use-error-feedback.ts` |
| 5 | Criar componente `ErrorFeedbackDialog` | `src/components/error-feedback-dialog.tsx` |
| 6 | Criar componente `ErrorFeedbackTrigger` | `src/components/error-feedback-trigger.tsx` |

### Fase 2: Integração nos Erros Existentes (2-3 dias)

| # | Tarefa | Ficheiro |
|---|--------|----------|
| 7 | Actualizar `ErrorBoundary` com botão reportar | `src/components/error-boundary.tsx` |
| 8 | Actualizar `ErrorState` com botão reportar | `src/components/error-state.tsx` |
| 9 | Actualizar `error/page.tsx` com formulário | `src/app/error/page.tsx` |
| 10 | Integrar trigger nos toasts principais | `src/components/ui/sonner.tsx` |

### Fase 3: Integração nos Toasts (3-5 dias)

| # | Tarefa | Prioridade |
|---|--------|------------|
| 11 | Substituir `toast.error()` em componentes críticos | Alta |
| 12 | Substituir `toast.error()` em componentes de média prioridade | Média |
| 13 | Substituir `toast.error()` restantes | Baixa |

### Fase 4: Notificações e Admin (1-2 dias)

| # | Tarefa | Ficheiro |
|---|--------|----------|
| 14 | Integrar envio de email via Resend | `src/app/api/feedback/route.ts` |
| 15 | Criar notificação in-app para admins | `src/app/api/feedback/route.ts` |
| 16 | Criar painel admin para ver feedbacks (opcional) | `src/app/admin/components/feedback-panel.tsx` |

### Fase 5: Testing e Polish (2-3 dias)

| # | Tarefa |
|---|--------|
| 17 | Testes unitários do utilitário `error-feedback.ts` |
| 18 | Testes do componente `ErrorFeedbackDialog` |
| 19 | Testes da API route `/api/feedback` |
| 20 | Teste end-to-end do fluxo completo |
| 21 | Teste de upload de imagens |
| 22 | Revise de UX e ajustes finais |

**Estimativa Total: 10-17 dias**

---

## 13. Estratégia de Testing

### 13.1 Infraestrutura de Testing

O projecto utiliza **Vitest 4.1.6** com:
- `jsdom` para simulação do browser
- `@testing-library/react` para testes de componentes
- Path alias `@` → `./src`

**Comando para correr testes:**
```bash
npx vitest run
# ou para watch mode:
npx vitest
```

### 13.2 Tipos de Teste

#### A) Testes Unitários (Vitest)

**1. Utilitário `error-feedback.ts`**

```typescript
// src/lib/error-feedback.test.ts
describe('error-feedback', () => {
  describe('getErrorContext', () => {
    it('deve capturar mensagem do erro', () => {
      const error = new Error('Teste error');
      const context = getErrorContext(error);
      expect(context.message).toBe('Teste error');
    });

    it('deve capturar URL actual', () => {
      const context = getErrorContext();
      expect(context.url).toContain('http');
    });

    it('deve capturar user agent', () => {
      const context = getErrorContext();
      expect(context.userAgent).toBeDefined();
    });
  });

  describe('submitErrorFeedback', () => {
    it('deve submeter feedback com sucesso', async () => {
      // Mock do fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await submitErrorFeedback({
        message: 'Teste',
        severity: 'medium',
        url: 'http://localhost:3000',
        include_tech_info: true
      });

      expect(result.success).toBe(true);
    });

    it('deve tratar erros de rede', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(submitErrorFeedback({
        message: 'Teste',
        severity: 'medium',
        url: 'http://localhost:3000',
        include_tech_info: true
      })).rejects.toThrow('Network error');
    });
  });
});
```

**2. Hook `use-error-feedback`**

```typescript
// src/hooks/use-error-feedback.test.ts
import { renderHook, act } from '@testing-library/react';
import { useErrorFeedback } from './use-error-feedback';

describe('useErrorFeedback', () => {
  it('deve inicializar com dialog fechado', () => {
    const { result } = renderHook(() => useErrorFeedback());
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('deve abrir dialog ao reportar erro', () => {
    const { result } = renderHook(() => useErrorFeedback());
    
    act(() => {
      result.current.reportError(new Error('Teste'));
    });

    expect(result.current.isDialogOpen).toBe(true);
  });

  it('deve fechar dialog', () => {
    const { result } = renderHook(() => useErrorFeedback());
    
    act(() => {
      result.current.reportError(new Error('Teste'));
    });
    
    act(() => {
      result.current.setIsDialogOpen(false);
    });

    expect(result.current.isDialogOpen).toBe(false);
  });
});
```

#### B) Testes de Componentes (Testing Library)

**1. `ErrorFeedbackDialog`**

```typescript
// src/components/error-feedback-dialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorFeedbackDialog } from './error-feedback-dialog';

describe('ErrorFeedbackDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    errorInfo: {
      message: 'TypeError: Cannot read property map',
      url: 'http://localhost:3000/test'
    }
  };

  it('deve renderizar quando aberto', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText('Reportar Erro')).toBeInTheDocument();
  });

  it('deve mostrar campos do formulário', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByLabelText(/descreve o que estavas a fazer/i)).toBeInTheDocument();
    expect(screen.getByText('Baixa')).toBeInTheDocument();
    expect(screen.getByText('Média')).toBeInTheDocument();
  });

  it('deve mostrar mensagem do erro detectado', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText(/TypeError/)).toBeInTheDocument();
  });

  it('deve ter botão de upload de imagem', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText(/anexar screenshot/i)).toBeInTheDocument();
  });

  it('deve validar campo obrigatório', async () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve chamar onOpenChange ao cancelar', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

**2. `ErrorFeedbackTrigger`**

```typescript
// src/components/error-feedback-trigger.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFeedbackTrigger } from './error-feedback-trigger';

describe('ErrorFeedbackTrigger', () => {
  it('deve renderizar botão de reportar', () => {
    render(<ErrorFeedbackTrigger errorMessage="Erro teste" />);
    expect(screen.getByText(/reportar/i)).toBeInTheDocument();
  });

  it('deve abrir dialog ao clicar', () => {
    render(<ErrorFeedbackTrigger errorMessage="Erro teste" />);
    fireEvent.click(screen.getByText(/reportar/i));
    expect(screen.getByText('Reportar Erro')).toBeInTheDocument();
  });
});
```

#### C) Testes de Integração (API Route)

```typescript
// src/app/api/feedback/route.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from './route';

describe('POST /api/feedback', () => {
  it('deve criar feedback com sucesso', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        message: 'Erro ao carregar imóvel',
        severity: 'high',
        url: 'http://localhost:3000/imoveis/123',
        user_agent: 'Mozilla/5.0',
        include_tech_info: true
      }
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('deve rejeitar sem mensagem', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        severity: 'medium',
        url: 'http://localhost:3000'
      }
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it('deve rejeitar severidade inválida', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        message: 'Teste',
        severity: 'invalid',
        url: 'http://localhost:3000'
      }
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });
});
```

#### D) Testes de Upload de Imagem

```typescript
// src/app/api/feedback/upload/route.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from './route';

describe('POST /api/feedback/upload', () => {
  it('deve fazer upload de imagem válida', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const { req } = createMocks({
      method: 'POST',
      body: { file }
    });

    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  it('deve rejeitar ficheiro maior que 5MB', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { 
      type: 'image/png' 
    });
    const { req } = createMocks({
      method: 'POST',
      body: { file: largeFile }
    });

    const response = await POST(req as any);
    expect(response.status).toBe(413);
  });

  it('deve rejeitar tipo inválido', async () => {
    const file = new File(['test'], 'test.exe', { type: 'application/exe' });
    const { req } = createMocks({
      method: 'POST',
      body: { file }
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });
});
```

### 13.3 Teste End-to-End (Manual)

**Fluxo completo para testar manualmente:**

1. **Iniciar servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

2. **Navegar para uma página com erro simulado:**
   - Criar um botão temporário que dispara `toast.error("Erro teste")`
   - Verificar que o toast aparece com botão "Reportar"

3. **Testar fluxo de feedback:**
   - Clicar "Reportar" no toast
   - Verificar que o dialog abre
   - Preencher descrição
   - Selecionar severidade
   - Anexar screenshot (opcional)
   - Clicar "Enviar"
   - Verificar toast de sucesso

4. **Verificar na base de dados:**
   ```sql
   SELECT * FROM error_feedbacks ORDER BY created_at DESC LIMIT 5;
   ```

5. **Verificar email recebido:**
   - Confirmar que o email chegou à equipa
   - Verificar que as imagens estão no email

6. **Testar ErrorBoundary:**
   - Forçar um erro React (ex: `throw new Error()`)
   - Verificar que o ErrorBoundary aparece
   - Clicar "Reportar Este Erro"
   - Verificar que o dialog abre com contexto pré-preenchido

7. **Testar utilizador anónimo:**
   - Fazer logout
   - Repetir passos 2-5
   - Verificar que o feedback é guardado sem `user_id`

### 13.4 Checklist de Testing

#### Componentes
- [ ] `ErrorFeedbackDialog` renderiza corretamente
- [ ] Campos do formulário funcionam
- [ ] Upload de imagem funciona (preview, remover)
- [ ] Validação de campos obrigatórios
- [ ] Submit com loading state
- [ ] Toast de sucesso após submit
- [ ] Dialog fecha ao cancelar

#### API
- [ ] POST /api/feedback cria registo
- [ ] Validação de dados obrigatórios
- [ ] Validação de severidade
- [ ] Upload de imagem para Supabase Storage
- [ ] Envio de email via Resend
- [ ] Criação de notificação in-app

#### Integração
- [ ] Toast com botão "Reportar" aparece
- [ ] ErrorBoundary com botão "Reportar"
- [ ] Utilizador logado → `user_id` preenchido
- [ ] Utilizador anónimo → `user_id` null
- [ ] Imagens aparecem no email
- [ ] Notificação aparece no painel admin

#### Edge Cases
- [ ] Submeter sem internet
- [ ] Upload de imagem > 5MB
- [ ] Upload de tipo inválido (.exe, .txt)
- [ ] Máximo de 3 imagens
- [ ] Rate limiting (5 feedbacks/hora)

### 13.5 Comandos de Testing

```bash
# Correr todos os testes
npx vitest run

# Correr testes específicos
npx vitest run src/lib/error-feedback.test.ts
npx vitest run src/components/error-feedback-dialog.test.tsx

# Watch mode (desenvolvimento)
npx vitest

# Coverage (se configurado)
npx vitest run --coverage
```

---

## 9. Dependências Necessárias

Nenhuma dependência nova é necessária. A feature utilise apenas:

- **Radix UI Dialog** (`@radix-ui/react-dialog`) - já instalado
- **Sonner** - já instalado
- **Lucide React** - já instalado (ícones AlertTriangle, Send, etc.)
- **Supabase** - já configurado
- **Resend** - já configurado

---

## 10. Considerações Técnicas

### 10.1 Anonymous Users

O KerHome permite utilizadores anónimos. O feedback deve funcionar para:
- **Utilizadores logados**: `user_id` e `user_email` são preenchidos automaticamente
- **Utilizadores anónimos**: Campos ficam null, mas feedback é guardado com `session_id` do browser

### 10.2 Rate Limiting

Implementar rate limiting simples no client para evitar spam:
- Máximo 5 feedbacks por utilizador por hora
- Usar localStorage para tracking

### 10.3 Tamanho dos Dados

- `error_stack` e `component_stack`: truncar a 10KB para evitar abuse
- `metadata`: limite de 5KB

### 10.4 LGPD / Privacidade

- Incluir nota de privacidade no dialog
- Dados técnicos são opcionais (checkbox)
- Permitir ao utilizador apagar o seu histórico de feedbacks

---

## 11. Métricas de Sucesso

Após implementação, medir:
- Nº de feedbacks recebidos por semana
- Severidade média dos feedbacks
- Tempo médio entre report e resolução
- % de erros que resultam em fixes
- Satisfação do utilizador (NPS)

---

## 12. Ficheiros Criados (Resumo)

```
src/
├── components/
│   ├── error-feedback-dialog.tsx      ← NOVO (com upload de imagens)
│   └── error-feedback-trigger.tsx     ← NOVO
├── hooks/
│   └── use-error-feedback.ts          ← NOVO
├── lib/
│   └── error-feedback.ts              ← NOVO
├── app/
│   └── api/
│       └── feedback/
│           ├── route.ts               ← NOVO
│           └── upload.ts              ← NOVO (endpoint de upload)
└── tests/
    ├── error-feedback.test.ts         ← NOVO (testes unitários)
    ├── error-feedback-dialog.test.tsx ← NOVO (testes componente)
    └── feedback-api.test.ts           ← NOVO (testes API)

database/
└── migrations/
    └── error_feedbacks_table.sql      ← NOVO (com coluna screenshots)

storage/
└── error-feedbacks/                   ← NOVO (bucket Supabase)

--- Ficheiros Modificados ---
src/
├── components/
│   ├── error-boundary.tsx             ← MODIFICADO (botão reportar)
│   └── error-state.tsx                ← MODIFICADO (botão reportar)
└── app/
    └── error/
        └── page.tsx                   ← MODIFICADO (formulário feedback)
```
