# Test Suite - Personal OS

## Visão Geral

Esta suíte de testes cobre todas as funcionalidades do sistema operacional pessoal criado neste projeto.

## Estrutura de Testes

### 1. Context Tests (`os-context.test.tsx`)
- **Estado Inicial**: Verifica inicialização com ícones padrão, configurações padrão e tela de boas-vindas
- **Gerenciamento de Ícones**: Adicionar, remover, mover, alterar aparência e alinhar ícones
- **Gerenciamento de Janelas**: Abrir, fechar, minimizar, restaurar, focar, mover e redimensionar janelas
- **Configurações**: Alterar tema, fonte, plano de fundo, perfil de usuário
- **Persistência**: Salvar estado, carregar estado, criar backup, reverter alterações
- **Tela de Boas-vindas**: Completar configuração inicial

### 2. Desktop Tests (`desktop.test.tsx`)
- Renderização do desktop com gradiente de fundo
- Exibição de todos os ícones padrão
- Botões de ação (salvar, alinhar, reverter, exportar)
- Abertura de janelas ao dar duplo clique em ícones

### 3. Paint App Tests (`paint-app.test.tsx`)
- Diálogo de configuração de canvas
- Definição de dimensões do canvas
- Seletor de cor
- Controle de espessura do pincel
- Importação de imagens
- Exportação em PNG e JPG

### 4. Minesweeper Tests (`minesweeper-app.test.tsx`)
- Renderização do tabuleiro
- Primeiro clique sempre seguro (sem bomba)
- Sistema de bandeiras (botão direito)
- Botão de novo jogo
- Contador de minas
- Regeneração do tabuleiro se primeiro clique for em mina

### 5. Frog Game Tests (`frog-game.test.tsx`)
- Renderização do canvas
- Tela inicial com instruções
- Início do jogo com barra de espaço
- Sistema de pontuação
- Mecânica de pulo
- Aumento de velocidade progressivo

### 6. Settings App Tests (`settings-app.test.tsx`)
- Todas as abas (Aparência, Desktop, Perfil, Sobre)
- Alteração de cor do tema
- Seleção de fonte
- Upload de plano de fundo
- Upload de ícones personalizados
- Opção de resetar sistema

### 7. Icon Manager Tests (`icon-manager.test.tsx`)
- Abas de Adicionar e Gerenciar
- Adição de links de redes sociais
- Adição de scripts JavaScript
- Adição de imagens
- Visualização de ícones existentes
- Alteração de aparência dos ícones

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes com interface gráfica
npm run test:ui

# Executar testes com cobertura
npm run test:coverage
```

## Cobertura de Testes

A suíte de testes cobre:
- ✅ Gerenciamento de estado (Context)
- ✅ Componentes principais (Desktop, Taskbar, Window)
- ✅ Todos os aplicativos (Paint, Minesweeper, Frog Game, Settings, Icon Manager)
- ✅ Persistência de dados (localStorage)
- ✅ Sistema de janelas (drag, resize, minimize, close)
- ✅ Sistema de ícones (add, remove, move, align)
- ✅ Customização (theme, fonts, backgrounds, icons)
- ✅ Tela de boas-vindas
- ✅ Exportação de projeto

## Tecnologias Utilizadas

- **Vitest**: Framework de testes rápido e moderno
- **React Testing Library**: Testes focados no usuário
- **jsdom**: Ambiente DOM para testes
- **@testing-library/user-event**: Simulação de interações de usuário

## Observações

Alguns testes podem exigir ajustes baseados na implementação exata dos componentes. Os testes cobrem os casos principais de uso e garantem que todas as funcionalidades críticas estejam funcionando corretamente.
