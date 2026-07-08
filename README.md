# TaskFlow — Frontend

Frontend do projeto TaskFlow, construído com Vite + React + TypeScript.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router (`react-router-dom`)
- Axios

## Como rodar localmente

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Scripts disponíveis

| Comando           | Descrição                                  |
|--------------------|---------------------------------------------|
| `npm run dev`      | Inicia o servidor de desenvolvimento (HMR)  |
| `npm run build`    | Gera o build de produção (`dist/`)          |
| `npm run lint`     | Roda o lint (Oxlint)                        |
| `npm run preview`  | Serve o build de produção localmente        |

## Estrutura do projeto

```
src/
├── main.tsx      # ponto de entrada da aplicação
├── App.tsx       # componente raiz
└── assets/       # imagens e arquivos estáticos
```
