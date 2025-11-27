# 📚 Guia de Melhores Práticas - KerHome

## 🎯 Princípios Gerais

### 1. **Type Safety First**
NUNCA use `any`. Sempre crie interfaces e types apropriados.

```tsx
// ❌ RUIM
const data: any = fetchData();

// ✅ BOM
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = fetchData();
```

### 2. **Erro Handling Consistente**
Sempre trate erros de forma apropriada e amigável ao usuário.

```tsx
// ❌ RUIM
} catch (err) {
  console.log(err); // Não expõe ao usuário
}

// ✅ BOM
} catch (err) {
  console.error('Contexto do erro:', err);
  const message = err instanceof Error 
    ? 'Mensagem genérica ao usuário'
    : 'Erro desconhecido';
  toast.error(message);
}
```

### 3. **AbortController para Async Operations**
Sempre cancele requisições quando componentes desmontem.

```tsx
// ❌ RUIM
useEffect(() => {
  fetchData();
}, [dep]);

// ✅ BOM
useEffect(() => {
  const controller = new AbortController();
  
  (async () => {
    try {
      const data = await fetchData({ signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // handle error
    }
  })();

  return () => controller.abort();
}, [dep]);
```

### 4. **React Query com Cache Strategy**
Sempre configure staleTime e gcTime apropriados.

```tsx
// ❌ RUIM
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

// ✅ BOM
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000,  // 10 minutos
  retry: 2,
  retryDelay: 1000,
});
```

---

## 📁 Estrutura de Pasta Recomendada

```
src/
├── app/              # Next.js app router
├── components/       # Componentes reutilizáveis
│   ├── common/      # Componentes genéricos
│   ├── forms/       # Componentes de formulário
│   ├── layouts/     # Layouts
│   └── ui/          # Componentes de UI (shadcn)
├── hooks/           # Custom hooks
├── lib/
│   ├── constants/   # Constantes da app
│   ├── schemas/     # Zod schemas
│   ├── types/       # Type definitions
│   ├── utils/       # Funções utilitárias
│   ├── functions/   # Funções de negócio
│   └── supabase/    # Clients do Supabase
└── public/          # Arquivos estáticos
```

---

## 🔑 Convenções de Código

### Imports

```tsx
// 1. React e dependências externas
import React, { useEffect, useState } from 'react';

// 2. Componentes Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 3. Bibliotecas de UI/Style
import { Button } from '@/components/ui/button';

// 4. Types e interfaces
import type { PropertyData } from '@/types/property';

// 5. Funções e utilities
import { formatPrice } from '@/lib/utils/formatting';

// 6. Componentes locais
import { PropertyCard } from './property-card';
```

### Nomes de Variáveis e Funções

```tsx
// ✅ BOM
const isLoading = true;
const hasError = false;
const onClickHandler = () => {};
const getPropertyById = async (id: string) => {};
const PropertyCard = () => {};

// ❌ RUIM
const loading = true;
const error = false;
const handleClick = () => {};
const fetchProperty = async (id: string) => {}; // muito genérico
const propertycard = () => {};
```

### Ordem de Propriedades em Componentes

```tsx
export function MyComponent({ prop1, prop2, children }: Props) {
  // 1. Hooks de estado
  const [state, setState] = useState();
  const router = useRouter();

  // 2. Custom hooks
  const { data, isLoading } = useCachedQuery(...);

  // 3. Refs
  const ref = useRef();

  // 4. Callbacks
  const handleClick = useCallback(() => {}, []);

  // 5. Effects
  useEffect(() => {}, []);

  // 6. Render
  return <div>...</div>;
}
```

---

## 🎨 Padrões de Componentes

### Componente com Dados

```tsx
import type { PropertyData } from '@/types/property';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { QueryLoading, QueryError } from '@/components/query-states';

export function PropertyList() {
  const { data, isLoading, error, refetch } = useCachedQuery(
    ['properties'],
    async () => getProperties(),
  );

  if (isLoading) return <QueryLoading />;
  if (error) return <QueryError error={error} onRetry={refetch} />;
  if (!data?.length) return <QueryEmpty />;

  return (
    <div>
      {data.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  );
}
```

### Formulário com Validação

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePropertySchema } from '@/lib/schemas/validation';

export function PropertyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreatePropertySchema),
  });

  const onSubmit = async (data) => {
    try {
      await createProperty(data);
      toast.success('Propriedade criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar propriedade');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

---

## 🚀 Performance

### Code Splitting

```tsx
// ❌ RUIM - Importa tudo
import * as utils from '@/lib/utils';

// ✅ BOM - Importa apenas o necessário
import { formatPrice } from '@/lib/utils/formatting';
```

### Memoization

```tsx
// Use memo para componentes que recebem muitas props
const MemoizedCard = memo(function Card({ data }: CardProps) {
  return <div>{data.title}</div>;
});

// Use useMemo para cálculos pesados
const expensiveValue = useMemo(
  () => expensiveCalculation(items),
  [items]
);

// Use useCallback para callbacks estáveis
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Images Optimization

```tsx
// ✅ BOM - Sempre use Next Image
import Image from 'next/image';

<Image
  src={url}
  alt="description"
  width={300}
  height={300}
  quality={75}
  placeholder="blur"
/>
```

---

## 🔐 Segurança

### Validação Server-Side

```tsx
// API Route
import { CreatePropertySchema } from '@/lib/schemas/validation';

export async function POST(req: Request) {
  const body = await req.json();
  
  // ✅ SEMPRE validar no servidor
  const result = CreatePropertySchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  // Processar dados validados
  await createProperty(result.data);
}
```

### Rate Limiting

```tsx
// Usar Upstash Redis para rate limiting
import { Ratelimit } from '@upstash/ratelimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for');
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
  });

  const { success } = await ratelimit.limit(ip!);
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  // ...
}
```

### Environment Variables

```tsx
// ✅ BOM - Usar tipos
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const;
```

---

## 🧪 Testing

### Estrutura de Testes

```
tests/
├── unit/
│   ├── lib/
│   │   └── utils.test.ts
│   └── hooks/
│       └── useCachedQuery.test.ts
├── integration/
│   └── dashboard.test.tsx
└── e2e/
    └── properties.e2e.ts
```

### Unit Test Exemplo

```tsx
import { formatPrice } from '@/lib/utils/formatting';

describe('formatPrice', () => {
  it('deve formatar preço com separadores', () => {
    expect(formatPrice(1500000)).toBe('1.500.000');
  });

  it('deve retornar string vazia para null', () => {
    expect(formatPrice(null)).toBe('');
  });
});
```

---

## 📋 Checklist para PR

- [ ] Sem `any` types
- [ ] Erro handling apropriado
- [ ] Validação com Zod (se aplicável)
- [ ] React Query com cache strategy
- [ ] Testes escritos
- [ ] AbortController em async operations
- [ ] Imports padronizados
- [ ] Sem código comentado/morto
- [ ] Performance optimization feita
- [ ] Accessibilidade verificada

---

## 🔗 Recursos

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
