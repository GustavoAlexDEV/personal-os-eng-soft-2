# Personal OS - Documentacao da API REST e Telas

## Sumario

1. [Visao Geral](#visao-geral)
2. [Arquitetura do Backend](#arquitetura-do-backend)
3. [Estrutura de Arquivos das Rotas](#estrutura-de-arquivos-das-rotas)
4. [Rotas REST Implementadas](#rotas-rest-implementadas)
5. [Modelo de Dados](#modelo-de-dados)
6. [Telas da Aplicacao](#telas-da-aplicacao)
7. [Links para Teste Funcional](#links-para-teste-funcional)

---

## Visao Geral

O **Personal OS** e um sistema operacional pessoal baseado em navegador que permite aos usuarios personalizar sua area de trabalho, gerenciar icones, e sincronizar suas configuracoes entre diferentes navegadores atraves de um codigo unico de 6 caracteres.

**Stack Tecnologico:**
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes (App Router)
- Banco de Dados: Neon (PostgreSQL Serverless)
- ORM/Client: `@neondatabase/serverless`

---

## Arquitetura do Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                          VIEW (Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│  OSContext          │  SettingsApp       │  ProfileBrowser      │
│  (contexts/)        │  (components/apps/)│  (components/apps/)  │
│                     │                    │                      │
│  - syncToCloud()    │  - Aba Sincronizar │  - Buscar perfil     │
│  - loadFromCloud()  │  - Salvar/Importar │  - Visualizar estado │
│  - updateCloud()    │  - Copiar codigo   │  - Modo somente-leit.│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER (API Routes)                    │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/sync              │  Cria novo perfil, gera codigo   │
│  GET  /api/sync/[code]       │  Busca perfil por codigo         │
│  PUT  /api/sync/[code]       │  Atualiza perfil existente       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MODEL (Database)                         │
├─────────────────────────────────────────────────────────────────┤
│  lib/db.ts                   │  Client Neon (sql tagged template)│
│  sync_profiles (tabela)      │  Armazena estado em JSONB        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Arquivos das Rotas

```
app/
└── api/
    └── sync/
        ├── route.ts              # POST /api/sync
        └── [code]/
            └── route.ts          # GET/PUT /api/sync/:code

lib/
└── db.ts                         # Client Neon reutilizavel
```

### `/lib/db.ts` - Client do Banco de Dados

```typescript
import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)
```

---

## Rotas REST Implementadas

### 1. POST `/api/sync` - Criar Novo Perfil

**Arquivo:** `app/api/sync/route.ts`

**Descricao:** Cria um novo perfil de sincronizacao com codigo unico de 6 caracteres.

**Request:**
```http
POST /api/sync
Content-Type: application/json

{
  "icons": [...],
  "settings": {
    "themeColor": "#6366f1",
    "fontFamily": "Inter",
    "backgroundImage": "",
    "username": "Joao",
    "profilePicture": "data:image/..."
  },
  "isWelcomeComplete": true
}
```

**Response (201 Created):**
```json
{
  "syncCode": "A3B7K9"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Dados incompletos"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Falha ao gerar codigo unico"
}
```

**Implementacao:**
```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const { icons, settings, isWelcomeComplete } = body

  // Validacao
  if (!icons || !settings) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  // Gera codigo unico de 6 caracteres
  let syncCode = generateCode()
  
  // Verifica unicidade (ate 10 tentativas)
  while (attempts < 10) {
    const existing = await sql`SELECT id FROM sync_profiles WHERE sync_code = ${syncCode}`
    if (existing.length === 0) break
    syncCode = generateCode()
  }

  // Insere no banco
  await sql`
    INSERT INTO sync_profiles (sync_code, state_data)
    VALUES (${syncCode}, ${stateData}::jsonb)
  `

  return NextResponse.json({ syncCode }, { status: 201 })
}
```

---

### 2. GET `/api/sync/[code]` - Buscar Perfil

**Arquivo:** `app/api/sync/[code]/route.ts`

**Descricao:** Busca um perfil pelo codigo de sincronizacao.

**Request:**
```http
GET /api/sync/A3B7K9
```

**Response (200 OK):**
```json
{
  "stateData": {
    "icons": [...],
    "settings": {...},
    "isWelcomeComplete": true
  },
  "updatedAt": "2026-05-14T12:30:00.000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Codigo invalido"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Perfil nao encontrado"
}
```

**Implementacao:**
```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const syncCode = code.toUpperCase()

  // Validacao: 6 caracteres alfanumericos
  if (!/^[A-Z0-9]{6}$/.test(syncCode)) {
    return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
  }

  const rows = await sql`
    SELECT state_data, updated_at FROM sync_profiles WHERE sync_code = ${syncCode}
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    stateData: rows[0].state_data,
    updatedAt: rows[0].updated_at,
  })
}
```

---

### 3. PUT `/api/sync/[code]` - Atualizar Perfil

**Arquivo:** `app/api/sync/[code]/route.ts`

**Descricao:** Atualiza um perfil existente com novos dados.

**Request:**
```http
PUT /api/sync/A3B7K9
Content-Type: application/json

{
  "icons": [...],
  "settings": {...},
  "isWelcomeComplete": true
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Dados incompletos"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Perfil nao encontrado"
}
```

**Implementacao:**
```typescript
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const syncCode = code.toUpperCase()

  // Validacao do codigo
  if (!/^[A-Z0-9]{6}$/.test(syncCode)) {
    return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
  }

  const body = await request.json()
  const { icons, settings, isWelcomeComplete } = body

  // Validacao dos dados
  if (!icons || !settings) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  const result = await sql`
    UPDATE sync_profiles
    SET state_data = ${stateData}::jsonb, updated_at = NOW()
    WHERE sync_code = ${syncCode}
    RETURNING id
  `

  if (result.length === 0) {
    return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
```

---

## Modelo de Dados

### Tabela `sync_profiles`

```sql
CREATE TABLE sync_profiles (
  id SERIAL PRIMARY KEY,
  sync_code VARCHAR(6) NOT NULL UNIQUE,
  state_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Estrutura do `state_data` (JSONB)

```typescript
interface StateData {
  icons: Array<{
    id: string
    type: "app" | "social" | "script" | "image"
    name: string
    icon: string  // Emoji ou data:image/...
    position: { x: number; y: number }
    data?: {
      url?: string
      script?: string
      imageUrl?: string
    }
  }>
  settings: {
    themeColor: string      // Ex: "#6366f1"
    fontFamily: string      // Ex: "Inter"
    backgroundImage: string // Base64 ou URL
    username: string
    profilePicture: string  // Base64
    customIcons?: Array<{
      id: string
      name: string
      data: string  // Base64
    }>
  }
  isWelcomeComplete: boolean
}
```

---

## Telas da Aplicacao

### 1. Desktop Principal

**Componente:** `components/desktop.tsx`

**Funcionalidades:**
- Area de trabalho com icones arrastaveis
- Fundo personalizado (cor ou imagem)
- Sistema de janelas flutuantes

**Rotas REST Utilizadas:** Nenhuma diretamente (usa OSContext)

---

### 2. Configuracoes (Settings)

**Componente:** `components/apps/settings-app.tsx`

**Abas:**
| Aba | Descricao | Rota REST |
|-----|-----------|-----------|
| Perfil | Nome, foto de perfil | - |
| Aparencia | Cor do tema, fonte | - |
| Desktop | Plano de fundo, icones customizados | - |
| **Sincronizar** | Salvar/Importar da nuvem | POST, GET, PUT /api/sync |
| Sobre | Info do sistema, reset | - |

**Funcoes de Sincronizacao:**
- `handleSyncToCloud()` → `POST /api/sync`
- `handleLoadFromCloud()` → `GET /api/sync/[code]`
- `handleUpdateCloud()` → `PUT /api/sync/[code]`

---

### 3. Navegador de Perfis

**Componente:** `components/apps/profile-browser.tsx`

**Funcionalidades:**
- Buscar perfil por codigo de 6 caracteres
- Visualizar desktop de outro usuario (somente leitura)
- Exibir: avatar, nome, configuracoes visuais, lista de icones, preview do desktop

**Rota REST Utilizada:** `GET /api/sync/[code]`

**Fluxo:**
1. Usuario digita codigo (ex: `A3B7K9`)
2. Clica em buscar ou pressiona Enter
3. Chamada `GET /api/sync/A3B7K9`
4. Exibe dados do perfil remoto

---

### 4. Taskbar

**Componente:** `components/taskbar.tsx`

**Botoes de Acesso Rapido:**
| Icone | Acao | Janela Aberta |
|-------|------|---------------|
| Engrenagem | Configuracoes | SettingsApp |
| Paleta | Paint | PaintApp |
| Gamepad | Campo Minado | MinesweeperApp |
| Pasta | Gerenciar Icones | IconManager |
| Globo | Navegador | ProfileBrowser |

---

## Links para Teste Funcional

### Aplicacao em Producao

**URL Base:** `https://[seu-projeto].vercel.app`

### Endpoints da API

| Metodo | Endpoint | Descricao | Teste |
|--------|----------|-----------|-------|
| POST | `/api/sync` | Criar perfil | [Testar](#teste-post) |
| GET | `/api/sync/[code]` | Buscar perfil | [Testar](#teste-get) |
| PUT | `/api/sync/[code]` | Atualizar perfil | [Testar](#teste-put) |

---

### Teste POST - Criar Perfil

**cURL:**
```bash
curl -X POST https://[seu-projeto].vercel.app/api/sync \
  -H "Content-Type: application/json" \
  -d '{
    "icons": [
      {
        "id": "test-1",
        "type": "app",
        "name": "Teste",
        "icon": "🧪",
        "position": { "x": 20, "y": 20 }
      }
    ],
    "settings": {
      "themeColor": "#6366f1",
      "fontFamily": "Inter",
      "backgroundImage": "",
      "username": "Usuario Teste",
      "profilePicture": ""
    },
    "isWelcomeComplete": true
  }'
```

**Resposta Esperada:**
```json
{
  "syncCode": "X7Y2Z9"
}
```

---

### Teste GET - Buscar Perfil

**cURL:**
```bash
curl https://[seu-projeto].vercel.app/api/sync/X7Y2Z9
```

**Resposta Esperada:**
```json
{
  "stateData": {
    "icons": [...],
    "settings": {...},
    "isWelcomeComplete": true
  },
  "updatedAt": "2026-05-14T12:30:00.000Z"
}
```

---

### Teste PUT - Atualizar Perfil

**cURL:**
```bash
curl -X PUT https://[seu-projeto].vercel.app/api/sync/X7Y2Z9 \
  -H "Content-Type: application/json" \
  -d '{
    "icons": [
      {
        "id": "test-1",
        "type": "app",
        "name": "Teste Atualizado",
        "icon": "✅",
        "position": { "x": 50, "y": 50 }
      }
    ],
    "settings": {
      "themeColor": "#10b981",
      "fontFamily": "Roboto",
      "backgroundImage": "",
      "username": "Usuario Atualizado",
      "profilePicture": ""
    },
    "isWelcomeComplete": true
  }'
```

**Resposta Esperada:**
```json
{
  "success": true
}
```

---

### Teste via Interface (UI)

1. **Criar Perfil:**
   - Abra a aplicacao
   - Clique no icone de Engrenagem (Configuracoes)
   - Va para a aba "Sincronizar"
   - Clique em "Salvar na Nuvem (Gerar Codigo)"
   - Anote o codigo de 6 caracteres

2. **Importar Perfil:**
   - Em outro navegador, abra a aplicacao
   - Va para Configuracoes > Sincronizar
   - Digite o codigo no campo "Importar de Outro Navegador"
   - Clique em "Importar"

3. **Visualizar Perfil (Somente Leitura):**
   - Clique no icone de Globo na taskbar (Navegador)
   - Digite o codigo de outro usuario
   - Visualize o desktop sem alterar seus dados

---

## Diagramas PlantUML

Os diagramas de sequencia das rotas estao disponiveis em:

- `docs/backend-mvc.puml` - Arquitetura MVC completa
- Arquivos anexados pelo usuario:
  - `RotaPost.puml` - Sequencia do POST /api/sync
  - `RotaGet.puml` - Sequencia do GET /api/sync/[code]
  - `RotaPut.puml` - Sequencia do PUT /api/sync/[code]

---

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `DATABASE_URL` | Connection string do Neon PostgreSQL | Sim |

**Formato:**
```
postgresql://user:password@host/database?sslmode=require
```

---

## Codigos de Erro

| Codigo | Significado | Causa |
|--------|-------------|-------|
| 400 | Bad Request | Dados incompletos ou codigo invalido |
| 404 | Not Found | Perfil nao encontrado |
| 500 | Internal Server Error | Erro no servidor ou banco |

---

*Documentacao gerada automaticamente para o projeto Personal OS.*
