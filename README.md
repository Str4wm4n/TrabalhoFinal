# Imobiliária — API Spring Boot + vitrine Next.js

Trabalho final: uma API REST de imobiliária em **Spring Boot** (raiz do
projeto) consumida por um front-end em **React + Next.js** (pasta
[`frontend/`](frontend/)).

```
TrabalhoFinal/
├── src/                  API Spring Boot (Java 25, JPA, Spring Security + JWT)
├── database/             script SQL com dados iniciais
├── requests/             requisições .http para testar a API
└── frontend/             vitrine em Next.js
```

## Requisitos

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Java (JDK) | 25 ou superior | `java -version` |
| Maven | não precisa instalar: use o `mvnw` do projeto | `.\mvnw.cmd -v` |
| Node.js | 20.9 ou superior | `node -v` |
| XAMPP (MySQL/MariaDB) | qualquer versão recente | painel do XAMPP |

## 1. Banco de dados (XAMPP)

1. Abra o **XAMPP Control Panel** e clique em **Start** no módulo **MySQL**.
2. Pronto. Não é preciso criar o banco: a URL de conexão usa
   `createDatabaseIfNotExist=true`, então o banco `imobiliaria` é criado na
   primeira vez que o backend sobe.

A conexão está em [`application.properties`](src/main/resources/application.properties):
`localhost:3306`, usuário `root`, senha vazia (padrão do XAMPP).

## 2. Backend (porta 8080)

O token JWT é assinado com uma chave secreta que **não fica no código**: ela
vem da variável de ambiente `JWT_SECRET`, em Base64, com pelo menos 32 bytes.
No PowerShell, na raiz do projeto:

```powershell
# gera 32 bytes aleatórios e guarda em Base64 na variável desta janela
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)

# sobe a API
.\mvnw.cmd spring-boot:run
```

Quando aparecer `Started DemoApplication`, a API está em
<http://localhost:8080>. O Hibernate (`ddl-auto=update`) cria as tabelas
automaticamente.

> A variável vale só para aquela janela do PowerShell. Ao abrir outro
> terminal, gere de novo. Trocar o segredo invalida os tokens já emitidos.

## 3. Dados iniciais

Com o backend já iniciado ao menos uma vez (para as tabelas existirem), rode
[`database/dados-iniciais.sql`](database/dados-iniciais.sql):

- **phpMyAdmin:** <http://localhost/phpmyadmin> → banco `imobiliaria` → aba
  **SQL** → cole o conteúdo do arquivo → **Executar**; ou
- **terminal:**
  ```powershell
  Get-Content -Raw -Encoding UTF8 database\dados-iniciais.sql | C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 imobiliaria
  ```

O script pode ser executado mais de uma vez sem duplicar dados. Ele cria:

| Usuário | Senha | Tipo |
|---|---|---|
| `admin@imobiliaria.com` | `admin123` | ADMIN |
| `cliente@imobiliaria.com` | `cliente123` | USER |

…além de 4 bairros, 4 tipos de imóvel e 6 imóveis (3 para venda e 3 para
aluguel). As senhas ficam no banco como hash **BCrypt**.

## 4. Front-end (porta 3000)

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abra <http://localhost:3000>. A vitrine busca `GET /imoveis` pelo servidor do
Next.js. Para apontar para outra API, crie `frontend/.env.local` com
`API_URL=http://localhost:8080` (veja [`frontend/README.md`](frontend/README.md)).

## Regras de segurança

Login em `POST /auth/login` com `{ "email": "...", "senha": "..." }`. A
resposta traz um token, enviado nas próximas requisições no cabeçalho
`Authorization: Bearer <token>`.

| Rota | Sem token | USER | ADMIN |
|---|---|---|---|
| `GET` imóveis, bairros, tipos-imoveis, fotos | 200 | 200 | 200 |
| `POST/PUT/DELETE` imóveis, bairros, tipos-imoveis, fotos | 401 | 403 | ✅ |
| `PATCH /imoveis/{id}/status` | 401 | 403 | 200 |
| `/users` | 401 | 403 | ✅ |

- **401 Unauthorized**: não enviou token ou o token é inválido.
- **403 Forbidden**: está logado, mas o seu tipo de usuário não tem permissão.

Para testar, abra [`requests/seguranca.http`](requests/seguranca.http) no VS
Code com a extensão **REST Client**, rode os dois logins e depois cada
requisição.

Testes automatizados (usam banco H2 em memória, não precisam do XAMPP):

```powershell
.\mvnw.cmd test
```

## Problemas comuns

- **`Communications link failure` ao subir o backend:** o MySQL do XAMPP não
  está rodando. Dê Start no painel.
- **Erro ao criar `jwtService` / `Illegal base64 character`:** o `JWT_SECRET`
  não foi definido nesta janela ou não é Base64 válido. Gere de novo (passo 2).
- **Aviso `HHH000511 ... minimum supported version is 8.0.0`:** o XAMPP traz
  MariaDB 10.4, que o Hibernate 7 considera antigo. É só um aviso e o projeto
  funciona normalmente.
- **Vitrine mostra "Não foi possível carregar os imóveis":** o backend não está
  rodando na porta 8080.
