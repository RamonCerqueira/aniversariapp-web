import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MessageCircle, QrCode, CheckCircle2, RefreshCw,
  LogOut, Upload, Image as ImageIcon, Send, Sparkles, X, Link, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api.js';
import { useParty } from '../contexts/PartyContext.jsx';
import { useGuests } from './Guests/GuestContext.jsx';

// Modelos estáticos para ilustrar os convites
const TEMPLATES = [
  { id: 'classic', name: 'Clássico Elegante', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&h=600&fit=crop' },
  { id: 'modern', name: 'Moderno Neon', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&h=600&fit=crop' },
  { id: 'minimalist', name: 'Minimalista Claro', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=400&h=600&fit=crop' },
];

export default function WhatsAppIntegrationScreen() {
  const { currentParty } = useParty();
  const { guests } = useGuests(); // Contexto que gerencia a lista de convidados atual

  const [status, setStatus] = useState('LOADING'); // LOADING, DISCONNECTED, QR_CODE, CONNECTED
  const [qrCode, setQrCode] = useState(null);

  // Configuração do disparo
  const [configType, setConfigType] = useState('template'); // 'template', 'upload', 'link', 'rsvp'
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [customImage, setCustomImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Poll status a cada 5s se estiver desconectado ou aguardando QR
  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      if (status !== 'CONNECTED') {
        checkStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  // Preenche mensagem padrão quando festa ou tipo de configuração muda
  useEffect(() => {
    if (!currentParty) return;
    if (configType === 'rsvp') {
      setMessage(`Olá! Você está convidado(a) para *${currentParty.name}*! 🥳\n\nData: ${new Date(currentParty.date).toLocaleDateString('pt-BR')}\n\nConfirme sua presença pelo seu link personalizado:\n{{RSVP_LINK}}\n\nEspero você lá! 🎉`);
    } else {
      setMessage(`Olá! Você está convidado para *${currentParty.name}*! 🥳\n\nData: ${new Date(currentParty.date).toLocaleDateString('pt-BR')}\nHorário: ${currentParty.time || 'A definir'}\n\nConfirme sua presença no link: Celebrate.com.br/rsvp/${currentParty.id}\n\nEspero você lá!`);
    }
  }, [currentParty, configType]);

  const checkStatus = async () => {
    try {
      const res = await api.whatsapp.status();
      setStatus(res.status);
      setQrCode(res.qrCode);
    } catch (error) {
      console.error('Erro ao checar status:', error);
      setStatus('DISCONNECTED');
    }
  };

  const handleConnect = async () => {
    setStatus('LOADING');
    try {
      await api.whatsapp.connect();
      toast.info('Solicitando QR Code, aguarde...');
      // O poll via useEffect vai capturar a mudança
      setTimeout(checkStatus, 2000);
    } catch (error) {
      toast.error('Erro ao inicializar conexão.');
      setStatus('DISCONNECTED');
    }
  };

  const handleLogout = async () => {
    try {
      await api.whatsapp.logout();
      setStatus('DISCONNECTED');
      setQrCode(null);
      toast.success('Sessão encerrada com sucesso.');
    } catch (error) {
      toast.error('Erro ao desconectar.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMediaUrlToSend = () => {
    if (configType === 'link') return null;
    if (configType === 'upload') return customImage; // Base64 raw (Backend precisa de ajustes se for mandar base64 direto, usaremos null para simular)
    if (configType === 'template') {
      const t = TEMPLATES.find(t => t.id === selectedTemplate);
      return t ? t.url : null;
    }
    return null;
  };

  const handleSendBulk = async () => {
    if (!currentParty) {
      return toast.warning('Selecione uma festa no menu lateral primeiro.');
    }
    if (!message.trim()) {
      return toast.warning('A mensagem não pode ser vazia.');
    }

    const eligibleGuests = guests.filter(g => g.phone && g.phone.length > 8 && g.whatsappInvite);

    if (eligibleGuests.length === 0) {
      return toast.error('Nenhum convidado marcado para envio via WhatsApp possui telefone válido.');
    }

    setIsSending(true);
    toast.info(`Iniciando envio para ${eligibleGuests.length} contatos... Não feche a página!`);

    try {
      let res;
      if (configType === 'rsvp') {
        // Modo RSVP: envia link individual por convidado
        const rsvpContacts = eligibleGuests.map(g => ({ phone: g.phone, guestId: g.id }));
        res = await api.whatsapp.sendBulk(rsvpContacts.map(c => c.phone), message, null, { rsvpMode: true, contacts: rsvpContacts, origin: window.location.origin });
      } else {
        const phones = eligibleGuests.map(g => g.phone);
        res = await api.whatsapp.sendBulk(phones, message, null);
      }

      const successCount = res.results?.filter(r => r.success).length || 0;
      toast.success(`Disparo concluído! Enviado com sucesso para ${successCount} de ${eligibleGuests.length} contatos.`);
    } catch (error) {
      toast.error(error.message || 'Erro crítico durante o envio.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <MessageCircle size={32} className="text-emerald-500" /> WhatsApp Broadcast
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Conecte seu WhatsApp para disparar convites bonitos e automáticos para seus convidados confirmados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUNA ESQUERDA: CONEXÃO E PREVIEW */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de Conexão */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            {status === 'LOADING' && (
              <div className="py-8 flex flex-col items-center">
                <RefreshCw size={40} className="text-primary animate-spin mb-4" />
                <h3 className="font-bold">Sincronizando...</h3>
              </div>
            )}

            {status === 'DISCONNECTED' && (
              <div className="py-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <QrCode size={32} className="text-muted-foreground" />
                </div>
                <h3 className="font-black text-lg mb-2">Desconectado</h3>
                <p className="text-xs text-muted-foreground mb-6">Escaneie o QR Code com seu WhatsApp para conectar a plataforma.</p>
                <Button onClick={handleConnect} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold">
                  Gerar QR Code
                </Button>
              </div>
            )}

            {status === 'QR_CODE' && (
              <div className="py-2 flex flex-col items-center w-full">
                <h3 className="font-black text-lg mb-2 text-foreground">Leia o QR Code</h3>
                <p className="text-xs text-muted-foreground mb-4">Abra o WhatsApp {'>'} Aparelhos Conectados</p>
                <div className="bg-white p-2 rounded-2xl border border-border w-full aspect-square flex items-center justify-center mb-4">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
                  ) : (
                    <RefreshCw size={24} className="animate-spin text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" onClick={checkStatus} className="w-full rounded-xl text-xs font-bold" size="sm">
                  <RefreshCw size={14} className="mr-2" /> Atualizar
                </Button>
              </div>
            )}

            {status === 'CONNECTED' && (
              <div className="py-6 flex flex-col items-center w-full">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="font-black text-lg mb-1 text-emerald-600">Conectado!</h3>
                <p className="text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-widest">Aparelho Vinculado</p>
                <Button onClick={handleLogout} variant="destructive" className="w-full rounded-xl font-bold bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-colors border-0">
                  <LogOut size={16} className="mr-2" /> Desconectar
                </Button>
              </div>
            )}
          </div>

          {/* Dicas */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
            <h4 className="font-black text-sm text-emerald-700 flex items-center gap-2 mb-3">
              <Sparkles size={16} /> Como funciona o Disparo?
            </h4>
            <ul className="space-y-3 text-xs text-emerald-800/80 font-medium">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> O sistema envia a mensagem de forma espaçada para evitar bloqueios do WhatsApp.</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> Apenas convidados marcados com "Convidar via Whats" na lista recebem a mensagem.</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> Certifique-se de que o telefone está com o DDD correto.</li>
            </ul>
          </div>
        </div>

        {/* COLUNA DIREITA: CONFIGURAÇÃO */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`transition-opacity duration-300 ${status !== 'CONNECTED' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

            {/* Abas de Tipo de Convite */}
            <div className="flex bg-muted p-1 rounded-2xl mb-6 border border-border/50 gap-1">
              <button onClick={() => setConfigType('template')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${configType === 'template' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ImageIcon size={14} className="inline mr-1 -mt-0.5" /> Modelos
              </button>
              <button onClick={() => setConfigType('upload')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${configType === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Upload size={14} className="inline mr-1 -mt-0.5" /> Upload
              </button>
              <button onClick={() => setConfigType('link')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${configType === 'link' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Link size={14} className="inline mr-1 -mt-0.5" /> Texto
              </button>
              <button onClick={() => setConfigType('rsvp')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${configType === 'rsvp' ? 'bg-emerald-500 shadow-sm text-white shadow-emerald-500/20' : 'text-muted-foreground hover:text-foreground'}`}>
                <QrCode size={14} className="inline mr-1 -mt-0.5" /> RSVP
              </button>
            </div>

            {/* Configuração Visual */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm mb-6 min-h-[300px]">

              {configType === 'template' && (
                <div className="space-y-4">
                  <h3 className="font-black text-lg">Escolha um Modelo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {TEMPLATES.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all relative ${selectedTemplate === t.id ? 'border-primary ring-4 ring-primary/20 scale-105 z-10' : 'border-transparent hover:border-border'}`}
                      >
                        <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                        {selectedTemplate === t.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {configType === 'upload' && (
                <div className="space-y-4 h-full flex flex-col">
                  <h3 className="font-black text-lg">Upload de Convite</h3>
                  <p className="text-xs text-muted-foreground">Envie a arte oficial do seu evento. O formato ideal é 9:16 (vertical).</p>

                  {customImage ? (
                    <div className="relative w-48 mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-md">
                      <img src={customImage} alt="Convite Customizado" className="w-full h-full object-cover" />
                      <button onClick={() => setCustomImage(null)} className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer p-8">
                      <Upload size={32} className="text-primary mb-4" />
                      <span className="font-bold text-sm text-foreground">Clique para enviar uma imagem</span>
                      <span className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-widest">PNG ou JPG</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              )}

              {configType === 'link' && (
                <div className="space-y-4 h-full flex flex-col justify-center items-center text-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-black text-lg">Apenas Texto</h3>
                  <p className="text-sm font-medium text-muted-foreground max-w-sm">
                    Nenhuma imagem será enviada. Apenas o texto digitado abaixo será disparado. O WhatsApp gerará preview dos links na mensagem.
                  </p>
                </div>
              )}

              {configType === 'rsvp' && (
                <div className="space-y-4 h-full flex flex-col justify-center items-center text-center p-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                    <QrCode size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="font-black text-lg text-foreground">RSVP Digital Personalizado</h3>
                  <p className="text-sm font-medium text-muted-foreground max-w-sm">
                    Cada convidado recebe o <strong>link único do RSVP dele</strong>. Use <code className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-mono text-xs">{"{{ RSVP_LINK }}"}</code> na mensagem — o sistema substitui automaticamente.
                  </p>
                  {guests.filter(g => g.whatsappInvite && g.phone).length > 0 && (
                    <div className="w-full mt-2 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-left">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Preview da mensagem para o 1º convidado:</p>
                      <p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap break-all">
                        {message.replace('{{RSVP_LINK}}', `${window.location.origin}/rsvp/${guests.find(g => g.whatsappInvite && g.phone)?.id || '...'}`).slice(0, 200)}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Mensagem e Disparo */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="font-black text-lg">Texto do Convite (Legenda)</Label>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                  {guests.filter(g => g.phone && g.whatsappInvite).length} Contatos Selecionados
                </span>
              </div>

              <textarea
                className="w-full h-40 bg-card border border-border/50 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-inner"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite a mensagem que acompanhará o convite..."
              />

              {guests.filter(g => g.phone && g.whatsappInvite).length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-xl flex gap-3 text-sm font-semibold items-center">
                  <AlertTriangle size={20} className="shrink-0" />
                  Nenhum convidado com telefone válido foi marcado para envio via WhatsApp.
                </div>
              )}

              <Button
                onClick={handleSendBulk}
                disabled={isSending || guests.filter(g => g.phone && g.whatsappInvite).length === 0}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20 font-black text-sm tracking-wider uppercase border-0"
              >
                {isSending ? (
                  <><RefreshCw size={20} className="mr-2 animate-spin" /> Disparando Convites...</>
                ) : (
                  <><Send size={20} className="mr-2" /> Disparar para Todos</>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
