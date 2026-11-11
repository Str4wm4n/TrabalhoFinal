# Casa Clara — frontend

Frontend em React e Next.js para consultar a API Java de imóveis.

## Requisitos

- Node.js 20.9 ou superior
- API Spring Boot disponível em `http://localhost:8080`

## Executar localmente

Na pasta `frontend`, instale as dependências:

```powershell
npm install
```

Opcionalmente, configure outra URL para a API criando `.env.local` (veja `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Inicie o frontend:

```powershell
npm run dev
```

Abra <http://localhost:3000>. O navegador chama a API direto (com `Authorization:
Bearer <token>` nas rotas protegidas), então o backend precisa liberar CORS para
`http://localhost:3000`, o que já é o padrão do projeto. O token fica no
`localStorage` e é apagado no logout ou quando a API responde 401.

## Verificações

```powershell
npm run typecheck
npm run lint
npm run build
```
