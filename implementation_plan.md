# 🎉 Plano de Fechamento: Celebrate v1.0 — Os Últimos 4 Blocos

## Diagnóstico Atual (O que já funciona ✅)

| Módulo | Status | Observação |
|---|---|---|
| Autenticação (Login/Registro) | ✅ OK | Organizer e Supplier |
| Gestão de Festas | ✅ OK | CRUD completo |
| Lista de Convidados | ✅ OK | Com toggle WhatsApp |
| Disparo de WhatsApp | ✅ OK | Integrado w/wwebjs |
| Kanban de Tarefas | ✅ OK | CRUD + prioridade |
| Finanças (Despesas) | ✅ OK | Com gráficos |
| Busca de Fornecedores | ✅ OK | Com filtros e GPS |
| Chat com Fornecedor | ✅ OK | Tempo real |
| Portal do Fornecedor | ✅ OK | Perfil completo |
| Sidebar com Logo + Gradiente | ✅ OK | Recém atualizada |
| Selects Premium (Radix UI) | ✅ OK | Todos substituídos |
| RSVP — Página pública | ⚠️ INCOMPLETO | Precisa de redesign total + acompanhantes nomeados |
| WhatsApp — Modo RSVP no disparo | ⚠️ INCOMPLETO | Falta aba de disparo personalizado com link RSVP individual |
| PDF de Convidados | ❌ FALTANDO | — |
| PDF Financeiro | ❌ FALTANDO | — |
| PDF de Tarefas | ❌ FALTANDO | — |
| QR Code na confirmação | ❌ FALTANDO | — |
| Leitura de QR Code (check-in) | ❌ FALTANDO | — |

---

## 📦 Bloco 1 — RSVP: Redesign Total + Acompanhantes Nomeados

### Como funciona o fluxo atual (para entender o contexto)

1. Organizador cria um convidado na **Lista de Convidados** com nome, telefone e número de acompanhantes permitidos.
2. Clica em **Enviar Convite** (ícone de carta) → abre o `SendInviteModal.jsx`.
3. O modal mostra o link único `http://localhost:3100/rsvp/{guest.id}` e um botão para enviar via WhatsApp.
4. O convidado abre o link no celular e vê o `RSVPPage.jsx` — **esta é a página que precisa de repaginação total**.
5. Ele clica em "Vou sim! 🎉" e o status é atualizado no banco.

> [!IMPORTANT]
> A página RSVP é uma **rota pública standalone** (`/rsvp/:id`) que qualquer pessoa pode acessar **sem estar logada**. Ela é renderizada completamente separada da sidebar e do sistema principal. O problema atual é que o design está genérico e faltam os campos de nome dos acompanhantes.

### Problema
A página RSVP existe e funciona, mas:
- Design genérico, não parece um convite de festa de verdade
- Não coleta os **nomes dos acompanhantes** (só o número)
- Sem nenhuma identidade visual de "convite digital premium"

### Solução

#### [MODIFY] Backend — `schema.prisma`
- Adicionar campo `companionNames String[] @default([])` no modelo `Guest`
- Rodar `pnpm prisma db push`

#### [MODIFY] Backend — `guestController.js` → `rsvpResponse`
- Aceitar `companionNames` no body e salvar no banco.

#### [MODIFY] Frontend — `RSVPPage.jsx` → **Redesign completo**
A nova página terá o visual de um **convite digital de luxo**:
- Fundo com gradiente salmão/dourado (seguindo identidade Celebrate)
- Logo do Celebrate no topo (discreta)
- Card central com efeito de envelope/convite físico digitalizado
- Dados da festa: nome, data, horário, local, anfitrião
- Nome do convidado em destaque ("Olá, **JOÃO SILVA**!")
- Seção "Você + X acompanhante(s)" clara e elegante
- Botões grandes e coloridos: ✅ Confirmar / ❌ Recusar
- **Quando confirmar com companions > 0**: formulário animado aparece solicitando o nome completo de cada acompanhante
- Após confirmação: QR Code do convidado já aparece na tela (para salvar no celular)
- Botões: Adicionar ao Google Calendar + Como Chegar
- **Zero sidebar, zero menu, zero header do sistema**

---

## 📦 Bloco 2 — PDFs de Relatórios (3 PDFs)

> **Estratégia técnica**: Usar a biblioteca `jsPDF` + `jspdf-autotable` no **frontend** (sem precisar do backend), gerando o PDF diretamente no navegador. Isso é mais simples, mais rápido, não consome servidor e permite download instantâneo.

#### [NEW] `src/components/Reports/ReportPDFGenerator.js`
- Módulo utilitário com funções reutilizáveis: cabeçalho com logo, rodapé com número de página, paleta de cores do Celebrate.

### PDF 1 — Lista de Convidados

Conteúdo:
- Cabeçalho com nome da festa, data, local
- Estatísticas: Total, Confirmados, Pendentes, Recusados
- Tabela com: Nº, Nome, Acompanhantes, Nomes dos Acompanhantes, Status (com cor)
- **QR Code** de cada convidado no final (em página separada, para impressão e check-in)

#### [MODIFY] `src/components/Guests/GuestList.jsx`
- Adicionar botão "📄 Gerar PDF" no cabeçalho da lista
- Ao clicar, gera e faz download do PDF com todos os convidados confirmados

### PDF 2 — Relatório Financeiro

Conteúdo:
- Cabeçalho: nome da festa + orçamento total
- Cards de resumo: Total Gasto, Total Pago, Total Pendente, % do orçamento utilizado
- Tabela agrupada por categoria com subtotais
- Gráfico de barras simples (desenhado com jsPDF shapes) por categoria

#### [MODIFY] `src/components/FinanceScreen.jsx`
- Botão "📄 Relatório PDF" na tela de finanças

### PDF 3 — Relatório de Tarefas

Conteúdo:
- Seção 1: ✅ Tarefas Concluídas (tabela verde)
- Seção 2: ⏳ Tarefas Pendentes (tabela âmbar)
- Resumo: total, concluídas, taxa de conclusão em %

#### [MODIFY] `src/components/Task/TaskList.jsx`
- Botão "📄 Relatório PDF" na tela de tarefas

---

## 📦 Bloco 3 — QR Code de Confirmação de Presença

> Cada convidado confirmado receberá um QR Code único. O código leva ao seu ID de convidado. O organizador usa a câmera para ler e confirmar a chegada.

### Como funciona o fluxo:
1. PDF de convidados já gera o QR Code de cada um (veja Bloco 2).
2. No dia da festa, o organizador entra na aba "Check-in" da sidebar.
3. Aponta a câmera do celular para o QR Code impresso.
4. O sistema lê, busca o convidado e marca como `checked_in = true`.
5. Exibe nome do convidado e acompanhantes numa tela de confirmação visual.

#### [MODIFY] Backend — `schema.prisma`
- Adicionar campo `checkedIn Boolean @default(false)` no modelo `Guest`
- Adicionar campo `checkedInAt DateTime?` no modelo `Guest`

#### [MODIFY] Backend — `guestController.js` + `guestRoutes.js`
- Novo endpoint `PATCH /guests/:id/checkin` (protegido por auth)
- Atualiza `checkedIn = true` e `checkedInAt = now()`

#### [NEW] `src/components/CheckInScreen.jsx`
- Nova tela completa de check-in via câmera
- Usa a biblioteca `react-qr-reader` para ler o QR Code pela câmera
- Ao ler um QR válido: chama API, exibe card animado com foto/nome do convidado
- Status visual: 🟢 Entrada Confirmada / 🔴 Já entrou / ⚠️ Convidado não confirmado

---

## 📦 Bloco 4 — Nova Aba "Check-in" na Sidebar

#### [MODIFY] `src/App.jsx`
- Adicionar item `Check-in / QR Code` no menu da sidebar com ícone `QrCode` do lucide-react
- Rota: navega para `CheckInScreen`

---

## Dependências a instalar (frontend)

```bash
pnpm add jspdf jspdf-autotable qrcode html5-qrcode
```

- `jspdf` → geração dos PDFs
- `jspdf-autotable` → tabelas bonitas nos PDFs
- `qrcode` → gerar QR Code como imagem para embutir nos PDFs
- `html5-qrcode` → ler QR Code pela câmera no Check-in

---

## Ordem de execução

1. **Bloco 1** — Redesign do RSVP + acompanhantes (backend + frontend) → 45 min
2. **Bloco 1.5** — WhatsApp aba RSVP Digital (backend + frontend) → 30 min
3. **Instalar dependências** (`jspdf`, `jspdf-autotable`, `qrcode`, `html5-qrcode`) → 2 min
4. **Bloco 2** — 3 PDFs (só frontend) → 60-90 min
5. **Bloco 3** — Check-in (backend + frontend) → 45 min
6. **Bloco 4** — Aba na Sidebar → 10 min

## Verification Plan

### RSVP
- Acessar `http://localhost:3100/rsvp/:id` com um convidado que tem `companions > 0`
- Confirmar presença e preencher nomes dos acompanhantes
- Verificar no banco que `companionNames` foi salvo

### PDFs
- Gerar PDF de cada tela e verificar layout, cores e dados corretos

### Check-in
- Gerar o QR Code de um convidado confirmado (via PDF)
- Abrir a aba Check-in, apontar câmera para o QR
- Verificar que o sistema registra a entrada no banco

> [!IMPORTANT]
> O QR Code embutido nos PDFs vai conter apenas o **ID do convidado** (ex: `6e021c38-96c8-4743-b4c9-65bad7772fb0`). O sistema de Check-in vai ler esse ID e buscar os dados no backend. Simples, seguro e sem internet no QR.
