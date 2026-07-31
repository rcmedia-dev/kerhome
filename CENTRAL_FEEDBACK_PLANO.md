# Plano: Central de Feedback (`/feedback`)

**Data:** 28 de julho de 2026
**Status:** EM PROGRESSO
**Rota:** `/feedback`

---

## 1. Visao Geral

Criar uma pagina publica no Kercasa onde qualquer utilizador (autenticado ou anonimo) pode enviar feedback: reportar bugs, sugerir melhorias, pedir funcionalidades, elogiar, ou simplesmente tirar duvidas. A pagina funciona como um portal de suporte da plataforma.

---

## 2. Tabela Supabase — `feedbacks`

### 2.1 Schema

```sql
CREATE TABLE feedbacks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name       TEXT,
  user_email      TEXT,
  categoria       TEXT NOT NULL CHECK (categoria IN (
    'bug',
    'sugestao',
    'nova_funcionalidade',
    'elogio',
    'problema_acesso',
    'reportar_conteudo',
    'duvida',
    'outro'
  )),
  titulo          TEXT NOT NULL,
  mensagem        TEXT NOT NULL,
  url             TEXT,
  user_agent      TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 RLS Policies

```sql
-- Qualquer um pode inserir (anonimos e autenticados)
CREATE POLICY "Anyone can insert feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (true);

-- Utilizadores autenticados veem os proprios
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

-- Admins veem e editam tudo (via service role, bypass RLS)
```

### 2.3 Index

```sql
CREATE INDEX idx_feedbacks_categoria ON feedbacks(categoria);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
```

---

## 3. Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---|---|---|
| `database/migrations/feedbacks_table.sql` | Novo | Migration da tabela |
| `src/app/feedback/page.tsx` | Novo | Pagina principal (client component) |
| `src/app/feedback/layout.tsx` | Novo | Metadata e SEO |

---

## 4. Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/header.tsx` | Adicionar `{ id: 'feedback', label: 'FEEDBACK', href: '/feedback', icon: MessageSquare }` ao array `navLinks` (linha 328) |
| `src/components/footer.tsx` | Adicionar `<Link href="/feedback">Feedback</Link>` na sidebar de links (linhas 20-37) |

---

## 5. Design da Pagina `/feedback`

### 5.1 Layout Geral

```
+----------------------------------------------+
|  [Hero Section]                              |
|  Central de Feedback                         |
|  Ajude-nos a melhorar o Kercasa              |
|  [MessageSquare icon]                        |
+----------------------------------------------+
|                                              |
|  [Formulario]                                |
|                                              |
|  Categoria* (grid 2x4 de cards clicaveis)   |
|  Titulo* (input curto)                       |
|  Mensagem* (textarea)                        |
|  Email (input, opcional, pre-preenchido)     |
|  Pagina de origem (input, pre-preenchido)    |
|                                              |
|  [Enviar Feedback]                           |
|                                              |
+----------------------------------------------+
```

### 5.2 Componentes Utilizados

- `react-hook-form` + `zod` para validacao
- `@/components/ui/input`, `textarea`, `button` para os campos
- `lucide-react` para icones das categorias
- `framer-motion` para animacoes de entrada
- `sonner` para toasts de sucesso/erro
- `@/lib/supabase/client` para inserir no Supabase
- Auth context para detectar se user esta logado

### 5.3 Categorias (Cards Clicaveis)

| Categoria | Label | Icone Lucide | Cor (bg/text) |
|---|---|---|---|
| `bug` | Reportar Bug | `Bug` | `bg-red-50 text-red-600 border-red-200` |
| `sugestao` | Sugestao de Melhoria | `Lightbulb` | `bg-amber-50 text-amber-600 border-amber-200` |
| `nova_funcionalidade` | Nova Funcionalidade | `Sparkles` | `bg-purple-50 text-purple-600 border-purple-200` |
| `elogio` | Elogio | `Heart` | `bg-pink-50 text-pink-600 border-pink-200` |
| `problema_acesso` | Problema de Acesso | `ShieldAlert` | `bg-orange-50 text-orange-600 border-orange-200` |
| `reportar_conteudo` | Reportar Conteudo | `Flag` | `bg-blue-50 text-blue-600 border-blue-200` |
| `duvida` | Duvida | `HelpCircle` | `bg-teal-50 text-teal-600 border-teal-200` |
| `outro` | Outro | `MessageSquare` | `bg-gray-50 text-gray-600 border-gray-200` |

**Estado selecionado:** Borda solida na cor da categoria, fundo levemente mais saturado, anel de foco.

### 5.4 Comportamento do Formulario

- **Se logado**: `user_id`, `user_name`, `user_email` pre-preenchidos do auth context. Campos de nome/email ocultos.
- **Se anonimo**: Campos de nome (opcional) e email (opcional) aparecem. Pelo menos email recomendado para follow-up.
- **URL de origem**: Campo hidden com `window.location.href` automaticamente. User pode editar se quiser.
- **User agent**: Capturado automaticamente via `navigator.userAgent` (nao visivel no form).

### 5.5 Submissao

```ts
// Fluxo
1. Validar formulario com zod
2. Coletar dados: { user_id?, user_name?, user_email?, categoria, titulo, mensagem, url, user_agent }
3. Inserir via Supabase client-side: supabase.from('feedbacks').insert(dados)
4. Toast success: "Feedback enviado com sucesso! Obrigado pela contribuicao."
5. Resetar formulario
```

### 5.6 Tratamento de Erros

- Erro de rede -> `toast.error('Erro ao enviar feedback. Tente novamente.')`
- Erro de validacao -> Mensagens inline nos campos (via react-hook-form)
- Rate limiting futuro (nao MVP)

---

## 6. SEO — `src/app/feedback/layout.tsx`

```ts
export const metadata: Metadata = {
  title: "Central de Feedback | Kercasa",
  description: "Ajude-nos a melhorar o Kercasa. Reporte erros, sugira melhorias, envie elogios ou tire duvidas sobre a plataforma.",
  keywords: ["feedback", "reportar bug", "sugestao", "melhoria", "suporte", "kercasa", "ajuda"],
  openGraph: {
    title: "Central de Feedback | Kercasa",
    description: "Ajude-nos a melhorar o Kercasa. Reporte erros, sugira melhorias ou envie elogios.",
    url: "https://kercasa.com/feedback",
    siteName: "Kercasa",
    locale: "pt_AO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Central de Feedback | Kercasa",
    description: "Ajude-nos a melhorar o Kercasa. Reporte erros, sugira melhorias ou envie elogios.",
  },
  alternates: {
    canonical: "https://kercasa.com/feedback",
  },
  other: {
    "X-Robots-Tag": "index, follow",
  },
};
```

---

## 7. Navegacao

### 7.1 Header (`src/components/header.tsx`)

Adicionar ao array `navLinks` (linha ~328):

```ts
{ id: 'feedback', label: 'FEEDBACK', href: '/feedback', icon: MessageSquare },
```

Colocar **depois de CONTACTO** para manter a logica de navegacao (paginas informativas no final).

### 7.2 Footer (`src/components/footer.tsx`)

Adicionar na sidebar de links (depois de "Contato"):

```tsx
<Link href="/feedback">Feedback</Link>
```

---

## 8. Fluxo do Utilizador

```
1. User clica "FEEDBACK" no header ou footer
2. Navega para /feedback
3. Ve hero + formulario
4. Seleciona categoria (grid de cards)
5. Preenche titulo + mensagem
6. (Se anonimo) opcionalmente preenche email
7. Clica "Enviar Feedback"
8. Ve toast de sucesso
9. Formulario reseta
```

---

## 9. Dependencias Existentes (nao precisa instalar nada)

- `react-hook-form` + `zod` — validacao
- `@/components/ui/input`, `textarea`, `button` — UI
- `lucide-react` — icones
- `framer-motion` — animacoes
- `sonner` — toasts
- `@/lib/supabase/client` — banco de dados
- Auth context — deteccao de login

---

## 10. Ordem de Implementacao

1. Criar migration SQL (`database/migrations/feedbacks_table.sql`)
2. Criar `src/app/feedback/layout.tsx` (metadata)
3. Criar `src/app/feedback/page.tsx` (pagina com formulario)
4. Modificar `src/components/header.tsx` (adicionar link)
5. Modificar `src/components/footer.tsx` (adicionar link)
6. Verificar TypeScript (`npx tsc --noEmit`)
7. Testar na UI
