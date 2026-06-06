import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api.js';
import { useParty } from '../contexts/PartyContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  RefreshCw,
  ArrowLeft,
  Users,
  Search,
  Check,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export default function CheckInScreen({ onBack }) {
  const { currentParty } = useParty();
  
  const [scannerActive, setScannerActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanResult, setScanResult] = useState(null); // { success: boolean, guest?: any, error?: string, statusType?: string }
  
  // Manual Input State
  const [manualId, setManualId] = useState('');
  
  const qrRef = useRef(null);
  const html5QrcodeRef = useRef(null);

  // Iniciar scanner de QR Code
  const startScanner = async () => {
    setCameraError(null);
    setScanResult(null);
    setScannerActive(true);

    // Permitir que o elemento DOM id="qr-reader" renderize antes de inicializar
    setTimeout(async () => {
      try {
        if (!document.getElementById('qr-reader')) return;

        const html5Qrcode = new Html5Qrcode('qr-reader');
        html5QrcodeRef.current = html5Qrcode;

        const qrCodeSuccessCallback = async (decodedText) => {
          // Evitar chamadas concorrentes enquanto processa uma leitura anterior
          if (isProcessing) return;
          
          // Parar temporariamente o scanner para focar no resultado
          await stopScanner();
          handleCheckIn(decodedText);
        };

        const config = { 
          fps: 10, 
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        };

        await html5Qrcode.start(
          { facingMode: 'environment' }, 
          config, 
          qrCodeSuccessCallback
        );
      } catch (err) {
        console.error('Erro ao iniciar câmera:', err);
        setCameraError('Permissão de acesso à câmera negada ou câmera não encontrada.');
        setScannerActive(false);
      }
    }, 100);
  };

  // Parar scanner
  const stopScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
      } catch (err) {
        console.error('Erro ao parar câmera:', err);
      }
    }
    setScannerActive(false);
  };

  // Limpar scanner ao desmontar o componente
  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(err => console.error(err));
      }
    };
  }, []);

  // Processar Check-in via ID do Convidado
  const handleCheckIn = async (guestId) => {
    const cleanId = guestId?.trim();
    if (!cleanId) return;

    setIsProcessing(true);
    try {
      const res = await api.guests.checkIn(cleanId);
      setScanResult({
        success: true,
        statusType: 'success',
        guest: res.guest,
        message: res.message || 'Presença confirmada!'
      });
      toast.success(res.message || 'Check-in realizado!', { position: 'top-center' });
    } catch (err) {
      console.error(err);
      // Analisar o erro de check-in retornado pelo backend
      // Erro 409: Já registrado, Erro 400: Não confirmado
      const errMsg = err.message || '';
      
      if (errMsg.includes('já realizou check-in')) {
        setScanResult({
          success: false,
          statusType: 'already_checked',
          message: errMsg,
          guestName: errMsg.split(' já realizou')[0]
        });
      } else if (errMsg.includes('não confirmou presença')) {
        setScanResult({
          success: false,
          statusType: 'not_confirmed',
          message: errMsg,
          guestName: errMsg.split(' não confirmou')[0]
        });
      } else {
        setScanResult({
          success: false,
          statusType: 'error',
          error: errMsg || 'Convidado não encontrado ou convite inválido nesta festa.'
        });
      }
      toast.error(errMsg || 'Erro no check-in.', { position: 'top-center' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    handleCheckIn(manualId);
    setManualId('');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen relative z-10 transition-colors duration-300">
      
      {/* Auroras de Fundo */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />

      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b border-border/40 pb-5 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full text-foreground border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <QrCode className="text-primary" size={28} /> Portaria & Check-in QR
            </h1>
            {currentParty && (
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                Evento: <strong className="text-foreground">{currentParty.name}</strong>
              </p>
            )}
          </div>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* COLUNA 1: SCANNER */}
        <div className="space-y-6 flex flex-col items-center">
          <Card className="w-full bg-card/85 backdrop-blur-md border border-border/50 shadow-lg p-6 flex flex-col items-center">
            
            {/* Box do Scanner */}
            <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-border/60 shadow-inner">
              
              {scannerActive ? (
                <div id="qr-reader" className="w-full h-full" />
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border border-border/30 text-muted-foreground/60 animate-pulse">
                    <Camera size={28} />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Câmera Inativa</p>
                </div>
              )}

              {/* Linha Pulsante de Leitura se scanner ativo */}
              {scannerActive && (
                <div className="absolute inset-x-0 h-0.5 bg-emerald-500 animate-scanner-line z-20 shadow-[0_0_8px_#10b981]" />
              )}
            </div>

            {/* Controles do Scanner */}
            <div className="w-full max-w-[320px] mt-6 space-y-3">
              {scannerActive ? (
                <Button 
                  onClick={stopScanner} 
                  variant="destructive"
                  className="w-full h-12 rounded-xl font-bold bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all border-0"
                >
                  Desativar Câmera
                </Button>
              ) : (
                <Button 
                  onClick={startScanner} 
                  className="w-full h-12 rounded-xl font-extrabold bg-gradient-to-r from-primary to-primary/95 text-primary-foreground shadow-md shadow-primary/10 hover:shadow-lg transition-all"
                >
                  <Camera size={18} className="mr-2" /> Ativar Câmera Traseira
                </Button>
              )}

              {cameraError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-[11px] font-semibold flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Entrada Manual de ID */}
          <Card className="w-full bg-card/85 backdrop-blur-md border border-border/50 shadow-sm p-5">
            <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
              <Search size={16} className="text-muted-foreground" /> Check-in Manual por ID
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  placeholder="Cole ou digite o ID do convidado..."
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="rounded-xl border border-border/60 bg-background/50 pr-8 text-xs font-semibold h-11"
                  disabled={isProcessing}
                />
              </div>
              <Button
                type="submit"
                disabled={isProcessing || !manualId.trim()}
                className="h-11 rounded-xl px-4 bg-secondary text-secondary-foreground font-bold text-xs"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : 'Confirmar'}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-2.5 leading-relaxed">
              <strong>Dica:</strong> Você encontra o ID do convidado na <strong>Lista de Convidados</strong> do painel administrativo (disponível para cópia rápida com um clique).
            </p>
          </Card>
        </div>

        {/* COLUNA 2: RESULTADO DO CHECK-IN */}
        <div className="flex flex-col justify-start">
          <AnimatePresence mode="wait">
            
            {/* 1. AGUARDANDO LEITURA */}
            {!scanResult && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-card/40 border border-border/30 rounded-3xl"
              >
                <QrCode size={48} className="text-muted-foreground/40 mb-4 animate-pulse" />
                <h3 className="font-bold text-foreground/80 mb-1.5">Aguardando QR Code</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Aponte a câmera traseira do dispositivo para o QR Code gerado na confirmação do convidado ou no PDF impresso.
                </p>
              </motion.div>
            )}

            {/* 2. SUCESSO - ENTRADA CONFIRMADA */}
            {scanResult && scanResult.statusType === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <Card className="bg-emerald-500/[0.03] border-2 border-emerald-500/30 rounded-3xl p-6 shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col items-center text-center space-y-5">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-inner border border-emerald-500/20 text-emerald-500">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                        Entrada Autorizada
                      </span>
                      <h2 className="text-2xl font-black text-foreground pt-3 px-2 leading-tight">
                        {scanResult.guest?.name?.toUpperCase()}
                      </h2>
                    </div>

                    {/* Detalhes do Convidado */}
                    <div className="w-full bg-card border border-border/50 rounded-2xl p-4 text-left space-y-3 shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Users size={16} className="text-primary" />
                        <span>Acompanhantes confirmados:</span>
                      </div>
                      
                      {scanResult.guest?.companionNames && scanResult.guest.companionNames.length > 0 ? (
                        <ul className="space-y-1.5 pl-6 border-l-2 border-primary/20">
                          {scanResult.guest.companionNames.map((name, index) => (
                            <li key={index} className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                              <Check size={12} className="text-emerald-500" /> {name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs font-bold text-muted-foreground pl-6">Nenhum acompanhante declarado.</p>
                      )}
                    </div>

                    <Button 
                      onClick={startScanner}
                      className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold"
                    >
                      Ler Próximo
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 3. AVISO - JÁ REALIZOU CHECK-IN ANTERIORMENTE */}
            {scanResult && scanResult.statusType === 'already_checked' && (
              <motion.div
                key="already_checked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <Card className="bg-amber-500/[0.03] border-2 border-amber-500/30 rounded-3xl p-6 shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col items-center text-center space-y-5">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center shadow-inner border border-amber-500/20 text-amber-500 animate-pulse">
                      <AlertTriangle size={36} />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/20">
                        Check-in Duplicado
                      </span>
                      <h2 className="text-2xl font-black text-foreground pt-3 px-2 leading-tight">
                        {scanResult.guestName?.toUpperCase()}
                      </h2>
                    </div>

                    <div className="w-full bg-card border border-border/50 rounded-2xl p-4 text-left shadow-inner">
                      <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                        Este convidado <strong>já teve sua entrada registrada</strong> no sistema Celebrate. Verifique a credencial.
                      </p>
                    </div>

                    <div className="flex gap-3 w-full">
                      <Button 
                        onClick={startScanner}
                        className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold"
                      >
                        Ler Próximo
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 4. AVISO - CONVIDADO NÃO CONFIRMADOO NO RSVP */}
            {scanResult && scanResult.statusType === 'not_confirmed' && (
              <motion.div
                key="not_confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <Card className="bg-rose-500/[0.03] border-2 border-rose-500/30 rounded-3xl p-6 shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col items-center text-center space-y-5">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center shadow-inner border border-rose-500/20 text-rose-500">
                      <XCircle size={36} />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 px-3 py-1 rounded-full border border-rose-500/20">
                        Não Confirmado
                      </span>
                      <h2 className="text-2xl font-black text-foreground pt-3 px-2 leading-tight">
                        {scanResult.guestName?.toUpperCase()}
                      </h2>
                    </div>

                    <div className="w-full bg-card border border-border/50 rounded-2xl p-4 text-left shadow-inner">
                      <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                        Este convidado <strong>não respondeu "Vou Sim"</strong> no RSVP ou foi cadastrado com status pendente/recusado.
                      </p>
                    </div>

                    <Button 
                      onClick={startScanner}
                      className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 5. ERRO GENÉRICO / NÃO ENCONTRADO */}
            {scanResult && scanResult.statusType === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <Card className="bg-red-500/[0.03] border-2 border-red-500/30 rounded-3xl p-6 shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col items-center text-center space-y-5">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center shadow-inner border border-red-500/20 text-red-500">
                      <XCircle size={36} />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 px-3 py-1 rounded-full border border-red-500/20">
                        Erro de Leitura
                      </span>
                      <h2 className="text-lg font-black text-foreground pt-3 px-2 leading-tight">
                        {scanResult.error}
                      </h2>
                    </div>

                    <Button 
                      onClick={startScanner}
                      className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold animate-pulse-custom"
                    >
                      Escanear Outro
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
