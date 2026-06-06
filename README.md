# Celebrate - Aplicativo Web de Organização de Festas

## 🎉 Sobre o Projeto

O **Celebrate** é uma aplicação web completa desenvolvida em React para ajudar pessoas a planejar, organizar e executar suas próprias festas de aniversário. A aplicação oferece uma experiência moderna e intuitiva com animações fluidas e design responsivo.

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- Login simples com nome, email e data de aniversário
- Persistência de sessão no localStorage
- Interface de login moderna com animações

### 🏠 Dashboard Principal
- Header animado com saudação personalizada
- Cards interativos com animações de entrada
- Estatísticas em tempo real das festas criadas
- Ações rápidas para funcionalidades principais
- Indicadores de progresso do planejamento

### 🎊 Gerenciamento de Festas
- Criação de festas com formulário completo
- Validação de campos obrigatórios
- Tipos de festa pré-definidos (Churrasco, Festa Infantil, etc.)
- Edição e visualização de detalhes
- Persistência local dos dados

### 🎨 Design e UX
- Paleta de cores personalizada (Azul Royal, Rosa Neon, Amarelo Ouro)
- Animações suaves com Framer Motion
- Design responsivo para desktop e mobile
- Componentes reutilizáveis e modulares
- Interface moderna e intuitiva

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **Vite** - Bundler e servidor de desenvolvimento
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de interface
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **JavaScript (JSX)** - Linguagem de programação

## 📁 Estrutura do Projeto

```
Celebrate-web/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes base do shadcn/ui
│   │   ├── AnimatedHeader.jsx
│   │   ├── Cards.jsx
│   │   ├── FormComponents.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   └── PartyDetailsScreen.jsx
│   ├── contexts/         # Contextos React
│   │   ├── AuthContext.jsx
│   │   └── PartyContext.jsx
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos personalizados
│   └── main.jsx         # Ponto de entrada
├── components.json       # Configuração shadcn/ui
├── tailwind.config.js   # Configuração Tailwind
├── vite.config.js       # Configuração Vite
└── package.json         # Dependências e scripts
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm

### Instalação
```bash
# Clone o projeto
git clone <url-do-repositorio>

# Entre no diretório
cd Celebrate-web

# Instale as dependências
npm install
# ou
pnpm install

# Execute o servidor de desenvolvimento
npm run dev
# ou
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Deploy no Vercel

### Método 1: Via CLI
```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça o deploy
vercel

# Para deploy de produção
vercel --prod
```

### Método 2: Via GitHub
1. Faça push do código para um repositório GitHub
2. Conecte o repositório no painel do Vercel
3. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Clique em "Deploy"

### Método 3: Drag & Drop
1. Execute `npm run build` para gerar a pasta `dist`
2. Acesse [vercel.com](https://vercel.com)
3. Arraste a pasta `dist` para a área de deploy

## 🎯 Funcionalidades Futuras (Roadmap)

- **Módulo de Convidados**: Importar contatos, gerenciar RSVP, Enviar convites por Whatsapp, Receber confirmação da presença, 
- **Churrascômetro**: Cálculo automático de consumo
- **Sistema de Tarefas**: Checklist personalizado
- **Fornecedores**: Busca e contratação de serviços
- **Calendário**: Planejamento de datas importantes
- **Notificações**: Lembretes e alertas
- **Compartilhamento**: Convites digitais
- **Relatórios**: Análise de custos e planejamento

## 🎨 Paleta de Cores

- **Primária**: #4169E1 (Azul Royal)
- **Secundária**: #FF1493 (Rosa Neon)
- **Acento**: #FFD700 (Amarelo Ouro)
- **Fundo**: #FFFFFF (Branco)
- **Texto Principal**: #000000 (Preto)
- **Texto Secundário**: #6B7280 (Cinza)

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Configurações de Desenvolvimento

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificação de código

### Variáveis de Ambiente
Não há variáveis de ambiente necessárias para o funcionamento básico da aplicação.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para facilitar o planejamento de festas de aniversário.

---

**Status do Projeto**: ✅ Funcional e pronto para uso
**Última Atualização**: Dezembro 2024

