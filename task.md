# ✅ Tasks — Celebrate v1.0 Final Closure

## Bloco 1 — RSVP: Redesign Total + Acompanhantes Nomeados
- [x] `schema.prisma` — adicionar `companionNames`, `checkedIn`, `checkedInAt` no modelo Guest
- [x] `pnpm prisma db push` — sincronizar banco
- [x] `guestController.js` — `rsvpResponse` aceitar `companionNames`
- [x] `RSVPPage.jsx` — redesign total (convite digital de luxo, sem sidebar, campos de acompanhantes, QR após confirmar)

## Bloco 1.5 — WhatsApp: Nova Aba "RSVP Digital"
- [x] `WhatsAppIntegrationScreen.jsx` — adicionar 4ª aba RSVP Digital com placeholder {{RSVP_LINK}}
- [/] Backend `whatsapp` controller — suportar rsvpMode com link individual por convidado

## Instalar Dependências
- [x] `pnpm add jspdf jspdf-autotable qrcode html5-qrcode` (frontend)

## Bloco 2 — 3 PDFs de Relatórios
- [ ] `src/components/Reports/ReportPDFGenerator.js` — módulo utilitário base
- [ ] `GuestList.jsx` — botão + PDF de convidados (com QR Codes individuais)
- [ ] `FinanceScreen.jsx` — botão + PDF financeiro
- [ ] `TaskList.jsx` — botão + PDF de tarefas

## Bloco 3 — Check-in via Câmera (QR Code)
- [x] Backend `guestRoutes.js` + `guestController.js` — endpoint `PATCH /guests/:id/checkin`
- [ ] `src/components/CheckInScreen.jsx` — tela de check-in com câmera (html5-qrcode)

## Bloco 4 — Sidebar
- [ ] `App.jsx` — nova aba "Check-in / QR" na sidebar
