# TaskFlow — Frontend

Frontend do projeto TaskFlow, construído com Vite + React + TypeScript.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router (`react-router-dom`)
- Axios
- Vitest + Testing Library

## Como rodar localmente

1. Copie o `.env.example` para `.env` e ajuste se necessário:

   ```bash
   cp .env.example .env
   ```

   | Variável         | Descrição                          | Padrão                 |
   |------------------|-------------------------------------|-------------------------|
   | `VITE_API_URL`   | URL base da API do backend          | `http://localhost:8080` |

2. Instale as dependências e suba o servidor de desenvolvimento:

   ```bash
   npm install
   npm run dev
   ```

A aplicação sobe em `http://localhost:5173`. O backend (TaskFlow API) precisa estar rodando separadamente.

## Scripts disponíveis

| Comando           | Descrição                                  |
|--------------------|---------------------------------------------|
| `npm run dev`      | Inicia o servidor de desenvolvimento (HMR)  |
| `npm run build`    | Type-check + gera o build de produção (`dist/`) |
| `npm run test`     | Roda a suíte de testes (Vitest)             |
| `npm run lint`     | Roda o lint (Oxlint)                        |
| `npm run preview`  | Serve o build de produção localmente        |

## Estrutura do projeto

```
src/
├── main.tsx                    # ponto de entrada da aplicação
├── App.tsx                     # rotas da aplicação
├── pages/                      # uma pasta por tela (página + estilos + testes)
│   ├── categories/
│   ├── dashboard/
│   ├── login/
│   ├── not-found/
│   ├── register/
│   └── tasks/
├── components/
│   ├── category/               # componentes específicos de categoria (form, lista)
│   └── shared/                 # componentes reutilizáveis (navbar, modal, rota protegida)
├── layouts/                    # layouts compartilhados entre páginas (auth, app principal)
├── contexts/                   # Context API (sessão de autenticação)
├── hooks/                      # hooks de dados/estado (ex: useCategories)
├── services/                   # chamadas HTTP + regras de erro de cada domínio (auth, category)
├── utils/                      # helpers puros (normalização de erro, etc.)
└── test-utils/                 # helpers compartilhados entre arquivos de teste
```

## Testes

Testes ficam ao lado do arquivo que testam (`Componente.test.tsx`), usando Vitest + Testing Library com ambiente `jsdom`.

```bash
npm run test
```
