import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

class WhatsAppService {
  constructor() {
    this.client = null;
    this.qrCodeData = null;
    this.status = 'DISCONNECTED'; // DISCONNECTED, QR_CODE, CONNECTED
  }

  initialize() {
    if (this.client) {
      return;
    }

    console.log('Inicializando cliente WhatsApp...');
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: "Celebrate-main" }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      console.log('QR Code recebido!');
      this.qrCodeData = qr;
      this.status = 'QR_CODE';
    });

    this.client.on('ready', () => {
      console.log('Cliente WhatsApp está pronto e conectado!');
      this.status = 'CONNECTED';
      this.qrCodeData = null;
    });

    this.client.on('authenticated', () => {
      console.log('Autenticado com sucesso!');
    });

    this.client.on('auth_failure', msg => {
      console.error('Falha na autenticação', msg);
      this.status = 'DISCONNECTED';
      this.client = null;
    });

    this.client.on('disconnected', (reason) => {
      console.log('Cliente WhatsApp desconectado', reason);
      this.status = 'DISCONNECTED';
      this.qrCodeData = null;
      this.client.destroy();
      this.client = null;
    });

    this.client.initialize().catch(err => {
      console.error('Erro fatal ao inicializar WhatsApp:', err);
      this.status = 'DISCONNECTED';
    });
  }

  getStatus() {
    return {
      status: this.status,
      qrCode: this.qrCodeData
    };
  }

  async logout() {
    if (this.client) {
      await this.client.logout();
      await this.client.destroy();
      this.client = null;
    }
    this.status = 'DISCONNECTED';
    this.qrCodeData = null;
  }

  async sendBulkInvites(phoneNumbers, message, mediaUrl = null, options = {}) {
    if (this.status !== 'CONNECTED' || !this.client) {
      throw new Error('WhatsApp não está conectado.');
    }

    const { rsvpMode, contacts, origin } = options;
    const results = [];

    // Preparar mídia se existir
    let media = null;
    if (mediaUrl) {
      // TODO: Usar MessageMedia.fromUrl quando precisar enviar mídia
      // const { MessageMedia } = pkg;
      // media = await MessageMedia.fromUrl(mediaUrl);
    }

    for (const phone of phoneNumbers) {
      // Limpar formatação do telefone
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) continue;

      // Montar identificador do whatsapp-web.js (5511999999999@c.us)
      // O Brasil exige um '55' na frente
      const numberId = cleanPhone.startsWith('55') ? `${cleanPhone}@c.us` : `55${cleanPhone}@c.us`;

      // Personalizar a mensagem com o link de RSVP individual se rsvpMode estiver ativo
      let finalMessage = message;
      if (rsvpMode && Array.isArray(contacts)) {
        const contact = contacts.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
        if (contact && contact.guestId) {
          finalMessage = message.replace(/\{\{\s*RSVP_LINK\s*\}\}/g, `${origin}/rsvp/${contact.guestId}`);
        }
      }

      try {
        if (media) {
          await this.client.sendMessage(numberId, media, { caption: finalMessage });
        } else {
          await this.client.sendMessage(numberId, finalMessage);
        }
        results.push({ phone: cleanPhone, success: true });

        // Delay aleatório para evitar banimento (1 a 3 segundos)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      } catch (err) {
        console.error(`Erro ao enviar para ${cleanPhone}:`, err);
        results.push({ phone: cleanPhone, success: false, error: err.message });
      }
    }

    return results;
  }
}

export const whatsappService = new WhatsAppService();
