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

Opcionalmente, configure outra URL para a API criando `.env.local`:

```env
API_URL=http://localhost:8080
```

Inicie o frontend:

```powershell
npm run dev
```

Abra <http://localhost:3000>. A página consulta `GET /imoveis` no servidor
Next.js, então a URL da API não é exposta ao navegador e essa chamada não
depende de CORS no backend.

O backend precisa estar configurado com banco de dados e `JWT_SECRET`. A rota
`GET /imoveis` é pública conforme as regras atuais de segurança do Spring.

## Verificações

```powershell
npm run typecheck
npm run lint
npm run build
```
