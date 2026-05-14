"use client"

import JSZip from "jszip"

export async function generateExportZip(state: any, username: string, profilePicture: string) {
  const zip = new JSZip()

  // Package.json
  const packageJson = {
    name: "personal-os-exported",
    version: "1.0.0",
    description: "Personal OS Website Exported",
    type: "module",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
    dependencies: {
      react: "^19.2.0",
      "react-dom": "^19.2.0",
      next: "^16.0.0",
      tailwindcss: "^4.1.9",
      "lucide-react": "^0.454.0",
      "@radix-ui/react-accordion": "1.2.2",
      "@radix-ui/react-alert-dialog": "1.1.4",
      "@radix-ui/react-aspect-ratio": "1.1.1",
      "@radix-ui/react-avatar": "1.1.2",
      "@radix-ui/react-checkbox": "1.1.3",
      "@radix-ui/react-collapsible": "1.1.2",
      "@radix-ui/react-context-menu": "2.2.4",
      "@radix-ui/react-dialog": "1.1.4",
      "@radix-ui/react-dropdown-menu": "2.1.4",
      "@radix-ui/react-hover-card": "1.1.4",
      "@radix-ui/react-label": "latest",
      "@radix-ui/react-menubar": "1.1.4",
      "@radix-ui/react-navigation-menu": "1.2.3",
      "@radix-ui/react-popover": "1.1.4",
      "@radix-ui/react-progress": "1.1.1",
      "@radix-ui/react-radio-group": "1.2.2",
      "@radix-ui/react-scroll-area": "1.2.2",
      "@radix-ui/react-select": "2.1.4",
      "@radix-ui/react-separator": "1.1.1",
      "@radix-ui/react-slider": "1.2.2",
      "@radix-ui/react-slot": "1.1.1",
      "@radix-ui/react-switch": "1.1.2",
      "@radix-ui/react-tabs": "latest",
      "@radix-ui/react-toast": "1.2.4",
      "@radix-ui/react-toggle": "1.1.1",
      "@radix-ui/react-toggle-group": "1.1.1",
      "@radix-ui/react-tooltip": "1.1.6",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      cmdk: "1.0.4",
      "date-fns": "4.1.0",
      "embla-carousel-react": "8.5.1",
      "input-otp": "1.4.1",
      "react-day-picker": "9.8.0",
      "react-hook-form": "^7.60.0",
      "react-resizable-panels": "^2.1.7",
      recharts: "2.15.4",
      sonner: "^1.7.4",
      "tailwind-merge": "^2.5.5",
      "tailwindcss-animate": "^1.0.7",
      vaul: "^1.1.0",
      zod: "3.25.76",
      jszip: "^3.10.1",
    },
    devDependencies: {
      "@tailwindcss/postcss": "^4.1.9",
      "@types/node": "^22",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      postcss: "^8.5",
      tailwindcss: "^4.1.9",
      typescript: "^5",
    },
  }

  zip.file("package.json", JSON.stringify(packageJson, null, 2))

  // .gitignore
  zip.file(
    ".gitignore",
    `node_modules/
.next/
.env.local
.env.*.local
*.log
.DS_Store
pnpm-lock.yaml
dist/
build/
`,
  )

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      baseUrl: ".",
      paths: {
        "@/*": ["./*"],
      },
    },
    include: ["**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  }

  zip.file("tsconfig.json", JSON.stringify(tsconfig, null, 2))

  // next.config.mjs
  zip.file(
    "next.config.mjs",
    `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
};

export default nextConfig;
`,
  )

  // postcss.config.mjs
  zip.file(
    "postcss.config.mjs",
    `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`,
  )

  // .env.example
  zip.file(
    ".env.example",
    `# Environment variables for exported Personal OS\n# No sensitive data needed for this exported version\n`,
  )

  // Create README
  const readmeContent = `# Personal OS Website - ${username}

Seu website pessoal customizado com desktop, aplicações e muito mais!

## ⚡ Quick Start

### Windows

**Pré-requisitos:**
- Node.js 18+ instalado ([Baixar aqui](https://nodejs.org/))

**Passos:**
\`\`\`bash
# 1. Extraia o arquivo zip em uma pasta vazia
# 2. Abra PowerShell ou CMD na pasta extraída

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Abra http://localhost:3000 no navegador
\`\`\`

**Para produção:**
\`\`\`bash
npm run build
npm start
\`\`\`

---

### Linux / macOS

**Pré-requisitos (Ubuntu/Debian):**
\`\`\`bash
sudo apt-get update
sudo apt-get install nodejs npm
\`\`\`

**Pré-requisitos (macOS com Homebrew):**
\`\`\`bash
brew install node
\`\`\`

**Passos:**
\`\`\`bash
# 1. Extraia o arquivo zip em uma pasta vazia
unzip personal-os-website.zip
cd personal-os-website

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra http://localhost:3000 no navegador
\`\`\`

**Para produção:**
\`\`\`bash
npm run build
npm start
\`\`\`

---

## ☁️ Alternativas Online (Sem Instalação)

### Stackblitz
1. Acesse [stackblitz.com](https://stackblitz.com)
2. Clique em "New Project"
3. Selecione "Node.js"
4. Abra este repositório ou copie os arquivos
5. O Stackblitz compilará e executará automaticamente

### Vercel
1. Envie o projeto para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Selecione o repositório GitHub
5. Deploy automático

---

## 📋 Recursos Disponíveis

- **Desktop Customizável**: Arraste e organize seus ícones
- **Aplicações Built-in**: Paint, Campo Minado, Jogo do Sapo
- **Configurações**: Visualize seu perfil
- **Gerenciador de Ícones**: Veja seus ícones organizados
- **Scripts**: Execute scripts JavaScript compilados

---

## ⚠️ Limitações da Versão Exportada

Esta versão exportada possui restrições para manter a integridade do design:

- ❌ Ícones não podem ser renomeados (apenas visualizados e movidos)
- ❌ Tema não pode ser alterado
- ❌ Plano de fundo não pode ser alterado
- ❌ Fonte não pode ser alterada
- ❌ Perfil é apenas visualização (sem edição)
- ❌ Sistema não pode ser resetado
- ❌ Scripts novos não podem ser criados
- ✅ Ícones podem ser movidos e realinhados
- ✅ Scripts existentes podem ser compilados

---

## 🐛 Troubleshooting

**Erro: "npm: command not found"**
- Node.js não está instalado. Baixe em https://nodejs.org/

**Erro: "Port 3000 is already in use"**
\`\`\`bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>
\`\`\`

**Aplicação não inicia após \`npm run dev\`**
\`\`\`bash
# Limpe cache e reinstale
rm -rf node_modules .next
npm install
npm run dev
\`\`\`

**Erro: "Couldn't find any \`pages\` or \`app\` directory"**
- Certifique-se de que extraiu o arquivo zip em uma pasta vazia
- Não misture com outros projetos
- Verifique se existe a pasta \`app/\` no diretório raiz

---

## 📦 Estrutura do Projeto

\`\`\`
personal-os-website/
├── app/                    # Rotas e layout Next.js
│   ├── page.tsx          # Página principal
│   ├── layout.tsx        # Layout raiz
│   └── globals.css       # Estilos globais
├── components/            # Componentes React
│   ├── apps/             # Aplicações (Paint, Minesweeper, etc)
│   ├── ui/               # Componentes UI (shadcn)
│   └── ...
├── contexts/              # Context API (OS State)
├── hooks/                 # React hooks customizados
├── lib/                   # Utilitários
├── utils/                 # Funções auxiliares
├── public/                # Arquivos estáticos
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
└── next.config.mjs       # Configuração Next.js
\`\`\`

---

## 👤 Informações do Usuário

- **Nome**: ${username}
- **Perfil**: Disponível em Configurações
- **Criado em**: ${new Date().toLocaleDateString("pt-BR")}
- **Versão**: 1.0.0 (Exportada)

---

**Desfrute do seu Personal OS! 🎉**
`

  zip.file("README.md", readmeContent)

  // Create state.json
  const stateJson = {
    username,
    profilePicture,
    icons: state.icons || [],
    settings: {
      ...state.settings,
      isExported: true,
      canEditTheme: false,
      canEditBackground: false,
      canEditFont: false,
      canCreateIcons: false,
      canResetSystem: false,
    },
    exportedAt: new Date().toISOString(),
  }

  zip.file("public/state.json", JSON.stringify(stateJson, null, 2))

  // Create loading screen
  const loadingHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carregando - ${username}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(${state.settings?.themeColor || "59, 130, 246"}, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%);
      backdrop-filter: blur(10px);
    }

    .loading-container {
      text-align: center;
      max-width: 400px;
      padding: 20px;
    }

    .profile-picture {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 24px;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .username {
      color: white;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .loading-message {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      margin-bottom: 32px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading-container">
    ${profilePicture ? `<img src="data:image/png;base64,${profilePicture}" alt="Perfil" class="profile-picture">` : ""}
    <div class="username">${username}</div>
    <div class="loading-message">Bem-vindo ao seu Personal OS</div>
    <div class="spinner"></div>
  </div>

  <script>
    setTimeout(function() {
      window.location.href = "/";
    }, 2500);
  </script>
</body>
</html>
`

  zip.file("public/loading.html", loadingHtml)

  // Download the zip
  const blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${username}-personal-os.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
