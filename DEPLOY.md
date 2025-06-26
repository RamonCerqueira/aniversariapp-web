# 🚀 Guia de Deploy - AniversariApp

## Deploy no Vercel (Recomendado)

### Método 1: GitHub + Vercel (Mais Fácil)

1. **Suba o código para o GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AniversariApp"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/aniversariapp.git
   git push -u origin main
   ```

2. **Configure no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Clique em "Deploy"

### Método 2: Vercel CLI

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Para deploy de produção
vercel --prod
```

### Método 3: Drag & Drop

```bash
# Gere o build
npm run build

# Acesse vercel.com e arraste a pasta 'dist' para o deploy
```

## Deploy em Outras Plataformas

### Netlify

1. Gere o build: `npm run build`
2. Arraste a pasta `dist` para [netlify.com/drop](https://app.netlify.com/drop)
3. Configure redirects criando `dist/_redirects`:
   ```
   /*    /index.html   200
   ```

### GitHub Pages

```bash
# Instale gh-pages
npm install --save-dev gh-pages

# Adicione ao package.json:
"homepage": "https://seu-usuario.github.io/aniversariapp",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

### Firebase Hosting

```bash
# Instale Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicialize
firebase init hosting

# Configure:
# - Public directory: dist
# - Single-page app: Yes
# - Rewrite all urls to index.html: Yes

# Build e Deploy
npm run build
firebase deploy
```

## ✅ Checklist Pré-Deploy

- [ ] Teste local funcionando (`npm run dev`)
- [ ] Build sem erros (`npm run build`)
- [ ] Preview funcionando (`npm run preview`)
- [ ] README.md atualizado
- [ ] Variáveis de ambiente configuradas (se necessário)
- [ ] Domínio personalizado configurado (opcional)

## 🔧 Configurações Importantes

### Variáveis de Ambiente
Atualmente não há variáveis de ambiente necessárias, mas se precisar:

```bash
# .env.local
VITE_APP_NAME=AniversariApp
VITE_API_URL=https://api.exemplo.com
```

### Domínio Personalizado
No Vercel:
1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

## 🐛 Troubleshooting

### Erro de Build
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Página em Branco
- Verifique se o `vercel.json` está configurado corretamente
- Confirme que o build está gerando arquivos na pasta `dist`

### Rotas não Funcionam
- Certifique-se que há redirecionamento para `index.html`
- Verifique configuração de SPA no provedor

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build
2. Teste localmente primeiro
3. Consulte a documentação do provedor
4. Abra uma issue no repositório

---

**Boa sorte com o deploy! 🎉**

