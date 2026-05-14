# Personal OS - Sistema Operacional Pessoal

Uma aplicação web que simula um sistema operacional pessoal com área de trabalho personalizável, ícones, janelas e sincronização na nuvem.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app)

---

## Link para Teste Funcional

**Aplicacao em Producao:** [https://v0-novas-rotas-banco.vercel.app](https://v0-novas-rotas-banco.vercel.app)

---

## Telas da Aplicacao

### 1. Tela de Boas-Vindas
- **Descricao:** Tela inicial exibida na primeira vez que o usuario acessa a aplicacao
- **Funcionalidades:** 
  - Permite definir nome de usuario
  - Escolher cor do tema
  - Opcao de carregar perfil existente via codigo de sincronizacao

### 2. Area de Trabalho (Desktop)
- **Descricao:** Interface principal do sistema operacional
- **Funcionalidades:**
  - Icones arrastáveis na area de trabalho
  - Barra de tarefas inferior com aplicativos abertos
  - Menu iniciar com lista de aplicacoes
  - Relogio e indicadores de sistema

### 3. Janelas de Aplicativos
- **Descricao:** Janelas redimensionaveis e arrastaveis
- **Funcionalidades:**
  - Minimizar, maximizar e fechar
  - Redimensionamento livre
  - Arrastar pela barra de titulo
  - Foco automatico ao clicar

### 4. Configuracoes (Settings)
- **Descricao:** Aplicativo para personalizacao do sistema
- **Funcionalidades:**
  - Alterar nome de usuario
  - Escolher cor do tema
  - Definir imagem de perfil
  - Sincronizacao na nuvem (salvar/carregar/deletar)
  - Definicao de senha para protecao do perfil

### 5. Navegador de Perfis (Profile Browser)
- **Descricao:** Aplicativo para visualizar perfis publicos
- **Funcionalidades:**
  - Lista paginada de todos os perfis
  - Visualizacao detalhada de cada perfil
  - Estatisticas gerais (total de perfis, criados hoje/semana)

### 6. Criador de Icones
- **Descricao:** Aplicativo para criar novos icones na area de trabalho
- **Funcionalidades:**
  - Definir nome, URL e icone
  - Escolher entre diversos icones disponiveis
  - Criar atalhos para sites externos

---

## Rotas REST Implementadas

### Base URL
```
https://v0-novas-rotas-banco.vercel.app/api
```

---

### 1. Sincronizacao - Criar Novo Perfil

| Item | Valor |
|------|-------|
| **Endpoint** | `POST /api/sync` |
| **Descricao** | Cria um novo perfil de sincronizacao na nuvem |

**Request Body:**
```json
{
  "icons": [],
  "settings": {
    "username": "string",
    "themeColor": "#hexcolor",
    "profilePicture": "url"
  },
  "isWelcomeComplete": true
}
```

**Response (201):**
```json
{
  "syncCode": "ABC123"
}
```

**Erros:** `400` Dados incompletos | `500` Erro interno

---

### 2. Sincronizacao - Obter Perfil

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /api/sync/{code}` |
| **Descricao** | Obtem os dados de um perfil existente |
| **Parametros** | `code` (path) - Codigo de 6 caracteres |

**Response (200):**
```json
{
  "stateData": {
    "icons": [],
    "settings": {},
    "isWelcomeComplete": true
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:** `400` Codigo invalido | `404` Perfil nao encontrado | `500` Erro interno

---

### 3. Sincronizacao - Atualizar Perfil

| Item | Valor |
|------|-------|
| **Endpoint** | `PUT /api/sync/{code}` |
| **Descricao** | Atualiza os dados de um perfil existente |
| **Parametros** | `code` (path) - Codigo de 6 caracteres |

**Request Body:**
```json
{
  "icons": [],
  "settings": {
    "username": "string",
    "themeColor": "#hexcolor",
    "profilePicture": "url"
  },
  "isWelcomeComplete": true
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Erros:** `400` Codigo invalido ou dados incompletos | `404` Perfil nao encontrado | `500` Erro interno

---

### 4. Sincronizacao - Deletar Perfil

| Item | Valor |
|------|-------|
| **Endpoint** | `DELETE /api/sync/{code}/delete` |
| **Descricao** | Deleta um perfil da nuvem (requer senha se definida) |
| **Parametros** | `code` (path) - Codigo de 6 caracteres |

**Request Body (opcional):**
```json
{
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil ABC123 deletado com sucesso",
  "deletedCode": "ABC123"
}
```

**Erros:** `400` Codigo invalido | `401` Senha obrigatoria | `403` Senha incorreta | `404` Perfil nao encontrado | `500` Erro interno

---

### 5. Senha - Definir Senha do Perfil

| Item | Valor |
|------|-------|
| **Endpoint** | `POST /api/sync/{code}/password` |
| **Descricao** | Define uma senha de protecao para o perfil |
| **Parametros** | `code` (path) - Codigo de 6 caracteres |

**Request Body:**
```json
{
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Senha definida com sucesso"
}
```

**Erros:** `400` Senha invalida ou perfil ja possui senha | `404` Perfil nao encontrado | `500` Erro interno

---

### 6. Senha - Verificar se Perfil tem Senha

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /api/sync/{code}/password` |
| **Descricao** | Verifica se um perfil possui senha definida |
| **Parametros** | `code` (path) - Codigo de 6 caracteres |

**Response (200):**
```json
{
  "hasPassword": true
}
```

**Erros:** `404` Perfil nao encontrado | `500` Erro interno

---

### 7. Perfis - Listar Todos os Perfis

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /api/profiles` |
| **Descricao** | Lista todos os perfis com paginacao |
| **Query Params** | `page` (default: 1), `limit` (default: 10, max: 50) |

**Response (200):**
```json
{
  "profiles": [
    {
      "code": "ABC123",
      "username": "Usuario",
      "themeColor": "#6366f1",
      "profilePicture": "url",
      "iconCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Erros:** `500` Erro interno

---

### 8. Estatisticas - Obter Estatisticas Gerais

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /api/stats` |
| **Descricao** | Obtem estatisticas gerais sobre os perfis |

**Response (200):**
```json
{
  "totalProfiles": 150,
  "createdToday": 5,
  "createdThisWeek": 25,
  "recentProfiles": [
    {
      "syncCode": "ABC123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "oldestProfile": {
    "syncCode": "XYZ789",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Erros:** `500` Erro interno

---

## Estrutura do Banco de Dados

### Tabela: `sync_profiles`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | SERIAL | Identificador unico (PK) |
| `sync_code` | VARCHAR(8) | Codigo de sincronizacao unico |
| `state_data` | JSONB | Dados do perfil (icones, configuracoes) |
| `delete_password` | VARCHAR(255) | Senha de protecao (opcional) |
| `created_at` | TIMESTAMP | Data de criacao |
| `updated_at` | TIMESTAMP | Data da ultima atualizacao |

---

## Tecnologias Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Banco de Dados:** Neon (PostgreSQL Serverless)
- **UI Components:** shadcn/ui
- **Deploy:** Vercel

---

## Como Executar Localmente

1. Clone o repositorio
2. Instale as dependencias:
   ```bash
   pnpm install
   ```
3. Configure a variavel de ambiente `DATABASE_URL` com sua conexao Neon
4. Execute o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```
5. Acesse `http://localhost:3000`
