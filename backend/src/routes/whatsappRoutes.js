import express from 'express';
import { whatsappService } from '../services/whatsappService.js';
import qrcode from 'qrcode';

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const { status, qrCode } = whatsappService.getStatus();
    
    // Converter o QR Code raw em Data URL para o frontend exibir direto na tag <img>
    let qrDataUrl = null;
    if (qrCode) {
      qrDataUrl = await qrcode.toDataURL(qrCode);
    }

    res.json({ status, qrCode: qrDataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status do WhatsApp' });
  }
});

router.post('/connect', (req, res) => {
  try {
    const { status } = whatsappService.getStatus();
    if (status === 'DISCONNECTED') {
      whatsappService.initialize();
      res.json({ message: 'Inicialização solicitada' });
    } else {
      res.json({ message: 'WhatsApp já está conectado ou aguardando QR Code', status });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao tentar conectar WhatsApp' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await whatsappService.logout();
    res.json({ message: 'Desconectado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desconectar WhatsApp' });
  }
});

router.post('/send', async (req, res) => {
  const { phoneNumbers, message, mediaUrl, rsvpMode, contacts, origin } = req.body;
  
  if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return res.status(400).json({ error: 'Nenhum número de telefone fornecido' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Mensagem vazia' });
  }

  try {
    const results = await whatsappService.sendBulkInvites(phoneNumbers, message, mediaUrl, { rsvpMode, contacts, origin });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro ao realizar disparo em massa' });
  }
});

export default router;
