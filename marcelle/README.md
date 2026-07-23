# 👑 Marcelle 15 Anos - Convite & Gestão de Evento

Uma aplicação fullstack de alto nível desenvolvida para celebrar os 15 anos de Marcelle Dias. Este sistema combina uma experiência visual cinematográfica para os convidados com um painel administrativo robusto para gestão do evento.

## 🚀 Tecnologias

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [TailwindCSS 4](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/)
- **Backend**: Next.js API Routes
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Autenticação**: JWT (JSON Web Tokens) com cookies `httpOnly`
- **Segurança**: bcrypt para hash de senhas, Middleware de proteção de rotas

## ✨ Funcionalidades

### 🎬 Landing Page (Pública)
- **Design Cinematográfico**: Tema "Princesa Medieval" com cores Azul Royal, Vermelho Rubi e Dourado.
- **Hero Section**: Efeito parallax com castelo e partículas douradas.
- **História**: Linha do tempo animada contando a trajetória da debutante (Scroll Reveal).
- **O Evento**: Detalhes do baile com cards interativos.
- **RSVP Online**: Sistema de confirmação de presença via código de família.

### 🔐 Área Administrativa (Privada)
- **Dashboard**: Métricas em tempo real (Total de famílias, convidados, confirmados).
- **Gestão de Famílias**: CRUD completo. Criação de códigos de acesso únicos e definição de limite de convidados por família.
- **Lista de Convidados**: Visualização de todos os convidados, status de confirmação e filtros.
- **Segurança**: Login administrativo seguro e proteção de rotas via Middleware.

## 🛠️ Pré-requisitos

- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (Instância local ou remota, ex: Neon, Supabase)

## 📦 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/marcelle-15.git
   cd marcelle
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto e configure a URL do seu banco de dados e o segredo JWT:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/marcelle?schema=public"
   JWT_SECRET="seu-segredo-super-seguro"
   ```

4. **Configure o Banco de Dados:**
   Execute as migrações do Prisma para criar as tabelas:
   ```bash
   npx prisma db push
   ```

5. **Popule o Banco de Dados (Seed):**
   Crie o usuário administrador inicial:
   ```bash
   npm run db:seed
   ```
   > **Nota:** O usuário padrão criado será `admin@marcelle15.com` com a senha `admin`. **Altere a senha imediatamente após o primeiro login.**

## ▶️ Executando o Projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

- **Landing Page**: `/`
- **Login Admin**: `/admin/login`

## 📂 Estrutura do Projeto

```
/app
  /admin        # Rotas da área administrativa (protegidas)
  /api          # API Routes (Backend)
  /components   # Componentes React
    /sections   # Seções da Landing Page (Hero, About, RSVP...)
    /ui         # Componentes de UI reutilizáveis
  /lib          # Utilitários (Prisma, Auth, Password)
  /modules      # Módulos de domínio
  /prisma       # Schema do banco de dados e seed
```

## 📄 Licença

Este projeto é proprietário e desenvolvido exclusivamente para o evento de 15 anos de Marcelle Dias.
