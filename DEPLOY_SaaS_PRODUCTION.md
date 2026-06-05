# 🚀 Guia de Deploy em Produção (SaaS) — Celebrate!

Este manual detalha o processo completo de homologação e deploy de produção para o ecossistema **Celebrate!** utilizando a infraestrutura comercial solicitada:
1. **Banco de Dados**: Supabase (PostgreSQL Cloud com Connection Pooling).
2. **Backend (Express)**: Interservice VPS (Servidor Linux Ubuntu + PM2 + Nginx).
3. **Frontend (React/Vite)**: Vercel (Edge Network com SPA routing).

---

## 🏛️ Topologia de Produção

```mermaid
graph TD
    A[Cliente / Navegador] -->|HTTPS / DNS| B[Vercel Frontend]
    A -->|HTTPS / DNS| C[Nginx Reverse Proxy]
    C -->|Localhost Port 3000| D[Node.js Express VPS Interservice]
    D -->|Prisma Client / Port 6543| E[Supabase Connection Pooler]
    D -->|Migrations / Port 5432| F[Supabase Direct DB]
```

---

## 1. 🗄️ Configuração do Banco de Dados no Supabase

O Supabase oferece infraestrutura PostgreSQL gerenciada de alto desempenho com pooling de conexões (essencial para ambientes serverless ou APIs robustas).

### Passo 1: Criar o Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie uma conta.
2. Crie um novo projeto chamado `celebrate-saas`.
3. Defina a região (preferencialmente `sa-east-1` São Paulo para menor latência).
4. Defina uma senha forte para o banco de dados e guarde-a.

### Passo 2: Copiar as Strings de Conexão
Vá em **Project Settings > Database** no painel do Supabase. Copie duas conexões:

1. **Transaction Connection Pooler (Porta 6543)**: Usado pela API Express no dia a dia para economizar recursos de conexão.
   - String típica: `postgresql://postgres.[SEU_ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
2. **Session / Direct Connection (Porta 5432)**: Usado exclusivamente para executar migrações do Prisma.
   - String típica: `postgresql://postgres.[SEU_ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

---

## 2. 💻 Configuração do Backend na VPS Interservice

A **Interservice** disponibiliza servidores virtuais privados (VPS). Assumiremos um sistema operacional Linux Ubuntu LTS limpo.

### Passo 1: Acesso SSH
Acesse sua VPS pelo terminal:
```bash
ssh root@ip_da_sua_vps_interservice
```

### Passo 2: Instalar Node.js e Dependências
Execute as atualizações e instale o Node.js v20 (LTS) e o gerenciador de processos PM2:
```bash
# Atualizar repositórios
sudo apt update && sudo apt upgrade -y

# Instalar Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### Passo 3: Clonar e Configurar o Projeto na VPS
Recomendamos criar uma pasta dedicada em `/var/www/celebrate-api`:
```bash
mkdir -p /var/www/celebrate-api
cd /var/www/celebrate-api

# Clone seu repositório GitHub
git clone https://github.com/RamonCerqueira/aniversariapp-web.git .

# Vá para a pasta do backend
cd backend

# Instale as dependências
npm install --production
```

### Passo 4: Criar o arquivo `.env` de Produção
Crie e edite o arquivo `.env` na VPS dentro da pasta `backend`:
```bash
nano .env
```
Preencha com os dados reais de produção:
```env
PORT=3000
JWT_SECRET=coloque_uma_chave_longa_e_super_secreta_aqui_12345
DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### Passo 5: Executar Migrações do Prisma no Supabase
Com o arquivo `.env` preenchido na VPS, execute a sincronização de tabelas e modelos no Supabase:
```bash
npx prisma migrate deploy
```

### Passo 6: Iniciar e Configurar Startup Automático com PM2
O PM2 garante que o Express continue rodando mesmo após crashes ou reinicializações do servidor:
```bash
# Iniciar a API com PM2
pm2 start src/server.js --name celebrate-api

# Configurar PM2 para iniciar no boot do sistema
pm2 startup
# (Siga as instruções que o PM2 exibirá no console para copiar e colar o comando gerado)

# Salvar lista de processos ativa
pm2 save
```

---

## 3. 🌐 Configuração do Proxy Reverso (Nginx) e SSL

Para expor o backend de forma profissional através de um domínio seguro (ex: `https://api.celebrateapp.com.br`) na VPS Interservice.

### Passo 1: Instalar Nginx
```bash
sudo apt install nginx -y
```

### Passo 2: Configurar o Nginx
Crie um bloco de servidor virtual para sua API:
```bash
sudo nano /etc/nginx/sites-available/celebrate-api
```
Adicione a configuração redirecionando o tráfego externo para a porta `3000` local:
```nginx
server {
    listen 80;
    server_name api.celebrateapp.com.br; # Coloque seu domínio/subdomínio aqui

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Ative o site e teste o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/celebrate-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 3: Configurar SSL Grátis (Let's Encrypt / Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.celebrateapp.com.br
```
*(Selecione a opção de redirecionar automaticamente tráfego HTTP para HTTPS).*

---

## 4. 🚀 Deploy do Frontend no Vercel

O Vercel hospedará o frontend estático SPA de forma rápida e segura.

1. Acesse seu painel no [Vercel](https://vercel.com).
2. Clique em **Import Project** e selecione o repositório do Celebrate!.
3. Configure a build na aba **Build & Development Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
4. Configure as **Environment Variables** (Variáveis de Ambiente):
   - Adicione a variável que aponta para o endereço HTTPS de produção da sua VPS Interservice:
     * **Key**: `VITE_API_URL`
     * **Value**: `https://api.celebrateapp.com.br/api`
5. Clique em **Deploy**. O Vercel gerará o link de produção (ex: `https://celebrateapp.com.br`).

---

## 🤖 5. Automação CI/CD (GitHub Actions)

Podemos automatizar o deploy contínuo: sempre que você fizer um `git push` na branch `main`, o Vercel atualizará o Frontend e um Workflow do GitHub atualizará a VPS Interservice.

Crie um arquivo `.github/workflows/deploy-backend.yml` no projeto:

```yaml
name: Deploy Backend VPS Interservice

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Código
        uses: actions/checkout@v4

      - name: Executar Deploy via SSH na VPS Interservice
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/celebrate-api
            git pull origin main
            cd backend
            npm install --production
            npx prisma migrate deploy
            pm2 reload celebrate-api
```

### Chaves Necessárias no GitHub Secrets:
No seu repositório GitHub, vá em **Settings > Secrets and Variables > Actions** e adicione:
- `VPS_HOST`: O IP da sua VPS Interservice.
- `VPS_USER`: O usuário SSH da VPS (ex: `root`).
- `VPS_SSH_KEY`: A chave privada SSH cadastrada na VPS para login sem senha.

---

## 🔒 Checklist Final de Produção

1. [ ] Supabase com tabelas devidamente migradas (`npx prisma migrate deploy`).
2. [ ] API Express rodando e gerenciada pelo PM2 na VPS Interservice.
3. [ ] Nginx configurado com HTTPS/SSL ativo apontando para porta 3000.
4. [ ] Frontend no Vercel com a variável `VITE_API_URL` apontando corretamente para o domínio HTTPS da API.
