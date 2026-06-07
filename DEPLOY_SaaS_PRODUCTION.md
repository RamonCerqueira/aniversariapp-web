# 🚀 Guia de Deploy em Produção (VPS) — Celebrate!

Este manual detalha o processo completo de deploy em produção para o ecossistema **Celebrate!** na sua VPS Linux (Ubuntu), utilizando o domínio configurado **celebrate.genioplay.com.br** e a porta **3101 (Backend)**, com o **Frontend servido estaticamente direto pelo Nginx** para máxima performance.

---

## 🏛️ Topologia de Produção

```mermaid
graph TD
    A[Cliente / Navegador] -->|HTTPS / DNS| B[Nginx Web Server & Proxy Reverso]
    B -->|Serviço de Arquivos Estáticos| C[Frontend Build - /var/www/celebrate/dist]
    B -->|Proxy Reverso para localhost:3101| D[Backend Express - PM2]
    D -->|Prisma Client / Port 6543| E[Supabase Connection Pooler]
    D -->|Migrations / Port 5432| F[Supabase Direct DB]
```

---

## 1. 🗄️ Configuração do Banco de Dados no Supabase

Caso esteja utilizando o Supabase (PostgreSQL Cloud com pooling de conexões):

### Passo 1: Copiar as Strings de Conexão
Vá em **Project Settings > Database** no painel do Supabase. Copie duas conexões:

1. **Transaction Connection Pooler (Porta 6543)**: Usado pela API Express no dia a dia.
   - String típica: `postgresql://postgres.[SEU_ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
2. **Session / Direct Connection (Porta 5432)**: Usado exclusivamente para executar migrações do Prisma.
   - String típica: `postgresql://postgres.[SEU_ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

---

## 1.5. 🌐 Configuração do DNS no Registro.br

Para que o domínio **celebrate.genioplay.com.br** aponte para a sua VPS, você precisa configurar um apontamento DNS no Registro.br.

### Como configurar no painel do Registro.br:
1. Acesse o painel do [Registro.br](https://registro.br) e faça login.
2. Clique no domínio **genioplay.com.br**.
3. Role até a seção **DNS** e clique em **Configurar Zona DNS** (ou **Editar Zona**).
4. Adicione um novo registro com as seguintes informações:
   - **Nome / Host**: `celebrate` (assim ficará `celebrate.genioplay.com.br`)
   - **Tipo**: `A`
   - **Dados / Destino (IP)**: `153.75.244.238` (o IP da sua VPS)
5. Salve as alterações.

> [!NOTE]
> A propagação do DNS pode levar de alguns minutos até 24 horas, mas geralmente ocorre em menos de 30 minutos.

---

## 2. 💻 Configuração da VPS

Assumindo um sistema operacional Linux Ubuntu LTS limpo.

### Passo 1: Acesso SSH
Acesse sua VPS pelo terminal:
```bash
ssh root@ip_da_sua_vps
```

### Passo 2: Instalar Node.js, PM2 e Nginx
Instale o Node.js v20 (LTS), o gerenciador de processos PM2, o pnpm e o Nginx:
```bash
# Atualizar repositórios
sudo apt update && sudo apt upgrade -y

# Instalar Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar pnpm (gerenciador de pacotes do projeto)
sudo npm install -g pnpm

# Instalar Nginx
sudo apt install nginx -y
```

### Passo 3: Clonar o Projeto na VPS
Crie a pasta dedicada em `/var/www/celebrate` e clone o repositório:
```bash
mkdir -p /var/www/celebrate
cd /var/www/celebrate

# Clone seu repositório GitHub
git clone https://github.com/RamonCerqueira/aniversariapp-web.git .
```

---

## 3. ⚙️ Configuração e Deploy do Backend (Porta 3101)

### Passo 1: Instalar as dependências do Backend
```bash
cd /var/www/celebrate/backend

# Se for usar pnpm (Recomendado):
pnpm install --production

# OU se for usar npm:
npm install --production --legacy-peer-deps
```

### Passo 2: Criar o arquivo `.env` de Produção do Backend
Crie e edite o arquivo `.env` na VPS dentro de `/var/www/celebrate/backend`:
```bash
nano .env
```
Preencha com os dados reais de produção. Certifique-se de configurar a porta como **3101**:
```env
PORT=3101
JWT_SECRET=coloque_uma_chave_longa_e_super_secreta_aqui_12345
DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
# Adicione outras variáveis necessárias (Stripe, Gemini, WhatsApp etc)
```

### Passo 3: Executar Migrações do Prisma
Sincronize as tabelas com o Supabase executando o comando a partir da pasta `/var/www/celebrate/backend`:
```bash
npx prisma migrate deploy
```

### Passo 4: Iniciar o Backend com PM2
Inicie o servidor Express e garanta que ele continue rodando em segundo plano:
```bash
pm2 start src/server.js --name celebrate-backend
```

---

## 4. 🚀 Configuração e Deploy do Frontend (Servido Estaticamente)

O frontend (React/Vite) será servido diretamente pelo Nginx. Isso elimina a necessidade de rodar o frontend sob o gerenciamento do PM2, otimizando o consumo de CPU e memória RAM da VPS.

### Passo 1: Instalar dependências da raiz do projeto
```bash
cd /var/www/celebrate

# Se for usar pnpm (Recomendado):
pnpm install

# OU se for usar npm:
npm install --legacy-peer-deps
```

### Passo 2: Criar `.env` de produção do Frontend
Crie o arquivo `.env` na raiz do projeto (`/var/www/celebrate`):
```bash
nano .env
```
Configure a URL da API apontando para o seu domínio público com a rota `/api`:
```env
VITE_API_URL=https://celebrate.genioplay.com.br/api
```

### Passo 3: Gerar o Build do Frontend
Gere os arquivos estáticos de produção na pasta `dist/`:
```bash
pnpm run build
```

---

## 5. 🌐 Configuração do Proxy Reverso e Servidor de Arquivos (Nginx)

Configuraremos o Nginx para receber todas as requisições em `celebrate.genioplay.com.br`:
- Requisições `/api` -> Encaminhadas para o Backend (Porta 3101)
- Requisições `/uploads` -> Encaminhadas para os uploads locais do Backend (Porta 3101)
- Demais requisições `/` -> Nginx serve os arquivos estáticos do diretório `/var/www/celebrate/dist` com suporte a SPA routing (React Router).

### Passo 1: Criar arquivo de configuração do site no Nginx
```bash
sudo nano /etc/nginx/sites-available/celebrate
```

### Passo 2: Inserir a Configuração Completa do Servidor
Cole a configuração abaixo:
```nginx
server {
    listen 80;
    server_name celebrate.genioplay.com.br;

    # Direcionamento do Frontend Estático
    root /var/www/celebrate/dist;
    index index.html;

    # Suporte ao React Router (Fallback para index.html em rotas do SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend (Porta 3101)
    location /api {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Pasta de Uploads de Mídia do Backend
    location /uploads {
        proxy_pass http://localhost:3101;
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

### Passo 3: Ativar a Configuração e Reiniciar o Nginx
```bash
# Criar link simbólico para habilitar o site
sudo ln -s /etc/nginx/sites-available/celebrate /etc/nginx/sites-enabled/

# Desativar a configuração default (se houver) para evitar conflitos de rota
sudo rm -f /etc/nginx/sites-enabled/default

# Testar se a sintaxe do arquivo de configuração do Nginx está correta
sudo nginx -t

# Reiniciar Nginx para carregar as novas rotas e arquivos
sudo systemctl restart nginx
```

---

## 6. 🔒 Habilitar SSL / HTTPS Grátis (Let's Encrypt / Certbot)

O HTTPS é obrigatório para o funcionamento de recursos nativos como câmera (check-in de QR Code) e comunicação segura:

```bash
# Instalar Certbot para Nginx
sudo apt install certbot python3-certbot-nginx -y

# Obter e configurar automaticamente o certificado SSL
sudo certbot --nginx -d celebrate.genioplay.com.br
```
*(Durante a configuração, selecione a opção de redirecionar automaticamente todo o tráfego HTTP para HTTPS).*

---

## 7. 🤖 Inicialização Automática no Boot da VPS (PM2)

Certifique-se de que o backend reinicie caso o servidor sofra um crash ou reinicialização inesperada:

```bash
# Configurar inicialização automática do PM2 no boot do sistema
pm2 startup
# (Siga a instrução na saída do terminal do console para copiar e executar o comando com privilégios gerado)

# Salvar a lista atual de processos gerenciados (celebrate-backend)
pm2 save
```

---

## ✅ Checklist de Validação Pós-Deploy

1. [ ] Acessar `https://celebrate.genioplay.com.br` no navegador e certificar-se de que a tela de login carrega instantaneamente.
2. [ ] Efetuar login e garantir que as chamadas de API feitas para `/api/*` (bando de dados, sessões) batam corretamente na porta 3101.
3. [ ] Subir um arquivo de mídia (imagem/vídeo) e verificar se o Nginx serve a mídia a partir de `/uploads` sem erros.
4. [ ] Monitorar a API na VPS usando o comando `pm2 status` ou `pm2 logs celebrate-backend`.
