import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, UserPlus, X, Send, Loader2, Search, User, 
  Users as UsersIcon, AlertTriangle, Copy, Share2, 
  Smartphone, MessageCircle, Instagram 
} from "lucide-react";
import { api } from "../../../services/api.js";
import OrnamentalHeading from "../ui/OrnamentalHeading";
import MagicButton from "../ui/MagicButton";

const PIX_KEY = "86107744576";
const PIX_NAME = "MARCELLE DIAS";
const PIX_CITY = "SALVADOR";

function getCRC16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  let hex = (crc & 0xFFFF).toString(16).toUpperCase();
  return hex.padStart(4, "0");
}

const pixPart1 = "00020126330014br.gov.bcb.pix0111" + PIX_KEY + "5204000053039865802BR5913" + PIX_NAME + "6009" + PIX_CITY + "62070503***6304";
const PIX_CODE = pixPart1 + getCRC16(pixPart1);
const MARCELLE_PARTY_ID = "6e021c38-96c8-4743-b4c9-65bad7772fb0";

export default function RSVP() {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [guests, setGuests] = useState([]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [musicSuggestion, setMusicSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUrlIdLoaded, setIsUrlIdLoaded] = useState(false);
  const [willAttend, setWillAttend] = useState(null); // null | true | false

  // Check URL for guestId query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guestId = params.get("guestId");
    if (guestId) {
      setLoading(true);
      api.guests.publicGet(guestId)
        .then((guest) => {
          const mappedFamily = {
            id: guest.id,
            name: guest.name,
            code: guest.id,
            maxGuests: (guest.companions || 0) + 1,
            type: (guest.companions || 0) > 0 ? "FAMILY" : "FRIEND",
            isConfirmed: guest.status === "confirmed"
          };
          setSelectedFamily(mappedFamily);
          if (mappedFamily.isConfirmed) {
            setError("Sua presença já está confirmada no Celebrate!");
            setSuccess(true);
          } else {
            setStep(2);
            setGuestCount(mappedFamily.maxGuests);
          }
          setIsUrlIdLoaded(true);
        })
        .catch((err) => {
          console.error("Erro ao buscar convidado pelo link:", err);
          setError("Link de convite inválido ou expirado.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Debounced Search (only if search query is entered manually)
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(`/api/guests/public/search-external?partyId=${MARCELLE_PARTY_ID}&q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            const families = data.map((g) => ({
              id: g.id,
              name: g.name,
              code: g.id,
              maxGuests: (g.companions || 0) + 1,
              type: (g.companions || 0) > 0 ? "FAMILY" : "FRIEND",
              isConfirmed: g.status === "confirmed"
            }));
            setSearchResults(families);
          }
        } catch (err) {
          console.error("Search error:", err);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectFamily = (family) => {
    if (family.isConfirmed) {
      setError("Sua presença já está confirmada no Celebrate!");
      setSuccess(true);
      return;
    }
    setError("");
    setSelectedFamily(family);
    setGuestCount(family.maxGuests);
    setStep(2);
  };

  const handleProceedToNames = () => {
    if (willAttend === false) {
      setGuests([{ name: selectedFamily.name, ageGroup: "ADULT" }]);
      setStep(4);
      return;
    }
    const initialGuests = Array.from({ length: guestCount }).map((_, index) => ({
      name: index === 0 ? selectedFamily.name : "",
      ageGroup: "ADULT",
    }));
    setGuests(initialGuests);
    setStep(3);
  };

  const handleProceedToMessage = () => {
    if (guests.some(g => !g.name.trim())) {
      setError("Por favor, preencha os nomes de todos os participantes.");
      return;
    }
    setError("");
    setStep(4);
  };

  const handleGuestChange = (index, field, value) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const handleSubmitRSVP = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      const companionNames = willAttend ? guests.slice(1).map(g => g.name.trim()) : [];
      
      const res = await api.guests.publicRsvp(selectedFamily.id, {
        status: willAttend ? "confirmed" : "declined",
        companionNames: companionNames,
        email: email,
        favoriteSong: willAttend ? musicSuggestion : "",
        messageToHost: message
      });

      setSuccess(true);
      if (willAttend) {
        setShowConfetti(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao responder RSVP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent("Confirmei minha presença no aniversário da Marcelle! 👸✨");
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (success) {
    return (
      <section id="rsvp" className="min-h-screen bg-royal-dark flex items-center justify-center p-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal.png')] opacity-20 mix-blend-overlay" />
        
        {/* Celebration Stars */}
        {showConfetti && (
          <>
            <DisneyFireworks />
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0, 
                    x: "50%", 
                    y: "50%" 
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, Math.random() * 1 + 0.5, 0],
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                  }}
                  transition={{ 
                    duration: Math.random() * 2 + 1, 
                    repeat: Infinity,
                    delay: Math.random() * 0.5 
                  }}
                  className="absolute text-gold text-2xl"
                >
                  {["✨", "💫", "⭐", "👸", "👑"][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          </>
        )}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-pearl-cream text-royal-dark p-8 md:p-12 rounded-2xl text-center border-4 border-double border-gold shadow-[var(--shadow-wine)] relative max-w-2xl w-full"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center border-4 border-gold shadow-lg">
             {willAttend === false ? <X className="text-gold w-8 h-8" /> : <Check className="text-gold w-8 h-8" />}
          </div>

          <h2 className="text-3xl font-cinzel text-emerald-800 mb-4 mt-6 uppercase tracking-widest">
            {willAttend === false ? "Resposta Enviada!" : "Presença Confirmada!"}
          </h2>
          <p className="text-royal-light font-serif text-lg mb-8 italic">
            {willAttend === false 
              ? "Sentiremos sua falta no grande baile! Seu recado especial foi enviado para a Marcelle."
              : "Sua presença real foi registrada com sucesso. Estamos ansiosos para celebrar este momento mágico com você."}
          </p>

          {/* Gift Section - Apenas se for comparecer */}
          {willAttend !== false && (
            <div className="bg-white/50 border-2 border-gold/20 rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-xl font-cinzel text-ruby-dark mb-4 flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5" /> Presente Real
              </h3>
              <p className="text-sm text-royal-light mb-4 text-center">
                Se desejar presentear a Marcelle, fique à vontade para presenteá-la com o valor que quiser utilizando o PIX abaixo.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="bg-white p-2 rounded-xl border border-gold/30 shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_CODE)}`} 
                    alt="QR Code PIX" 
                    className="w-40 h-40"
                  />
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button 
                    onClick={copyPix}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                      copied ? "bg-emerald-600 text-white" : "bg-gold text-black hover:bg-gold-light"
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? "Copiado!" : "Copiar Chave PIX"}
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={shareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-all text-xs font-bold"
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </button>
                    <button 
                      onClick={() => window.open("https://instagram.com/marcelle_dias", "_blank")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-lg hover:opacity-90 transition-all text-xs font-bold"
                    >
                      <Instagram size={18} /> Instagram
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {willAttend === false && (
            <div className="bg-white/50 border-2 border-gold/20 rounded-2xl p-6 mb-8 text-center">
              <p className="text-sm text-royal-light mb-4">Você ainda pode acompanhar a Marcelle no Instagram:</p>
              <button 
                onClick={() => window.open("https://instagram.com/marcelle_dias", "_blank")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-lg hover:opacity-90 transition-all text-sm font-bold shadow-md"
              >
                <Instagram size={18} /> @marcelle_dias
              </button>
            </div>
          )}
          
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-gold/50 rounded-full" />
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="min-h-screen bg-royal-dark flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-royal)_0%,_var(--color-royal-dark)_100%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      
      {/* Container */}
      <div className="relative z-10 w-full max-w-2xl">
        <OrnamentalHeading title="Sua Presença" subtitle="Confirmação Real" className="mb-8" />

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-pearl-cream text-royal-dark rounded-xl shadow-[var(--shadow-wine)] border-4 border-double border-gold p-8 md:p-12 relative overflow-hidden"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 rounded-bl-[100%] border-b-4 border-l-4 border-gold/20" />
          
          <div className="relative z-10">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                <p className="font-cinzel text-xs text-royal-light tracking-widest">Buscando convite real...</p>
              </div>
            )}

            {!loading && (
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <p className="font-serif text-lg text-royal-light italic">
                        "Para adentrar o castelo, por favor, busque pelo seu nome."
                      </p>
                    </div>

                    <div className="relative group">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold w-5 h-5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="BUSCAR SEU NOME PARA CONFIRMAR"
                          className="w-full bg-white border-2 border-gold/30 rounded-lg pl-12 pr-6 py-4 text-center text-lg font-cinzel tracking-[0.1em] text-royal-dark placeholder:text-royal-light/40 focus:outline-none focus:border-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all uppercase"
                        />
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {searchResults.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => handleSelectFamily(f)}
                            className="w-full p-4 bg-white/55 border border-gold/20 rounded-lg hover:border-gold hover:bg-gold/5 transition-all text-left flex justify-between items-center group"
                          >
                            <div>
                              <span className="font-cinzel text-royal-dark group-hover:text-gold-dark transition-colors">{f.name}</span>
                              <div className="text-xs text-royal-light/60 flex gap-2 items-center mt-1">
                                 {f.type === 'FAMILY' ? <UsersIcon size={12}/> : <User size={12}/>}
                                 {f.type === 'FAMILY' ? `Possui acompanhantes (Max: ${f.maxGuests})` : 'Individual'}
                              </div>
                            </div>
                            {f.isConfirmed ? (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                 <Check size={10}/> Confirmado
                              </span>
                            ) : (
                               <span className="text-xs text-gold-dark font-medium uppercase tracking-tighter">Selecionar</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {searchQuery.length >= 3 && searchResults.length === 0 && (
                      <p className="text-center text-ruby-dark italic text-sm">Nenhum convidado encontrado.</p>
                    )}
                  </motion.div>
                ) : step === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {willAttend === null ? (
                      <div className="space-y-8">
                        <div className="text-center border-b border-gold/20 pb-6">
                          <h3 className="text-2xl font-cinzel text-ruby-dark uppercase tracking-widest">
                             {selectedFamily?.name}
                          </h3>
                          <p className="text-royal-light text-base mt-4 font-serif italic">
                            Você comparecerá ao Grande Baile de 15 anos da Marcelle?
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <button
                            onClick={() => {
                              setWillAttend(true);
                            }}
                            className="w-full sm:w-1/2 py-4 bg-gold hover:bg-gold-light text-black font-bold font-cinzel tracking-widest rounded-xl transition-all shadow-md shadow-gold/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                          >
                            <Check size={18} /> Sim, Comparecerei!
                          </button>
                          <button
                            onClick={() => {
                              setWillAttend(false);
                              setGuestCount(1);
                            }}
                            className="w-full sm:w-1/2 py-4 bg-transparent border-2 border-ruby-dark text-ruby-dark hover:bg-ruby/5 font-bold font-cinzel tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                          >
                            <X size={18} /> Não Poderei Comparecer
                          </button>
                        </div>

                        <div className="flex gap-4 pt-6 justify-center">
                          {!isUrlIdLoaded && (
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="py-3 text-royal-light hover:text-royal-dark font-cinzel text-sm underline cursor-pointer"
                            >
                              Voltar para a busca
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="text-center border-b border-gold/20 pb-6">
                          <h3 className="text-2xl font-cinzel text-ruby-dark uppercase tracking-widest">
                             {selectedFamily?.name}
                          </h3>
                          <p className="text-royal-light text-sm mt-2">
                            {willAttend ? "Informe quantas pessoas participarão do evento." : "Sentiremos sua falta! Confirme para deixar um recado especial."}
                          </p>
                        </div>

                        {willAttend ? (
                          <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-8">
                               <button 
                                 onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                 className="w-12 h-12 rounded-full border-2 border-gold text-gold hover:bg-gold hover:text-white transition-all text-2xl font-bold flex items-center justify-center cursor-pointer"
                               >
                                 -
                               </button>
                               <div className="text-center">
                                  <span className="text-5xl font-cinzel text-royal-dark">{guestCount}</span>
                                  <p className="text-xs text-royal-light uppercase tracking-widest mt-2">Participantes</p>
                               </div>
                               <button 
                                 onClick={() => setGuestCount(Math.min(selectedFamily?.maxGuests || 1, guestCount + 1))}
                                 className="w-12 h-12 rounded-full border-2 border-gold text-gold hover:bg-gold hover:text-white transition-all text-2xl font-bold flex items-center justify-center cursor-pointer"
                               >
                                 +
                               </button>
                            </div>
                            
                            <div className="p-4 bg-gold/5 rounded-xl border border-gold/20 text-center w-full">
                               <p className="text-sm text-royal-light">
                                  Vagas disponíveis para {selectedFamily?.type === 'FAMILY' ? 'sua família' : 'você'}: 
                                  <span className="font-bold text-ruby-dark ml-2">{selectedFamily?.maxGuests}</span>
                               </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 bg-ruby/5 rounded-xl border border-ruby/20 text-center">
                            <p className="text-sm text-ruby-dark font-serif italic">
                              Você escolheu que não poderá ir. Clique em Prosseguir para deixar seu recado.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-6">
                          <button
                            type="button"
                            onClick={() => setWillAttend(null)}
                            className="flex-1 py-3 text-royal-light hover:text-royal-dark font-cinzel text-sm cursor-pointer"
                          >
                            Voltar
                          </button>
                          <MagicButton onClick={handleProceedToNames} className="flex-1">
                            Prosseguir
                          </MagicButton>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : step === 3 ? (
                  <motion.div
                     key="step3"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-6"
                  >
                     <div className="text-center border-b border-gold/20 pb-6 mb-6">
                      <h3 className="text-2xl font-cinzel text-ruby-dark uppercase tracking-widest">Nomes dos Convidados</h3>
                      <p className="text-royal-light text-sm mt-2">Identifique cada participante individualmente.</p>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {guests.map((guest, index) => (
                        <div 
                          key={index} 
                          className="space-y-2 bg-white/50 p-4 rounded-lg border border-gold/20"
                        >
                          <div className="flex items-center gap-3">
                             <span className="text-xs font-cinzel text-gold-dark">{index + 1}.</span>
                             <input
                               type="text"
                               value={guest.name}
                               onChange={(e) => handleGuestChange(index, "name", e.target.value)}
                               placeholder={index === 0 ? "NOME DO CONVIDADO PRINCIPAL" : "NOME COMPLETO DO ACOMPANHANTE (OBRIGATÓRIO)"}
                               className="flex-1 bg-transparent border-none p-0 text-royal-dark font-cinzel focus:ring-0 placeholder:text-royal-light/30 uppercase text-sm focus:outline-none"
                               required
                               disabled={index === 0}
                             />
                          </div>
                          <div className="flex gap-4 pt-2 border-t border-gold/10">
                             {["ADULT", "TEEN", "CHILD"].map((age) => (
                               <button
                                 key={age}
                                 type="button"
                                 onClick={() => handleGuestChange(index, "ageGroup", age)}
                                 className={`text-[10px] px-2 py-1 rounded border transition-all cursor-pointer ${
                                   guest.ageGroup === age 
                                   ? "bg-gold text-white border-gold" 
                                   : "border-gold/30 text-royal-light hover:border-gold"
                                 }`}
                               >
                                 {age === "ADULT" ? "ADULTO" : age === "TEEN" ? "TEEN" : "CRIANÇA"}
                               </button>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-ruby-dark font-serif italic text-center mt-2">
                       * É obrigatório o preenchimento de todos os acompanhantes para validação de entrada na recepção.
                    </p>

                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 py-3 text-royal-light hover:text-royal-dark font-cinzel text-sm cursor-pointer"
                      >
                        Voltar
                      </button>
                      <MagicButton onClick={handleProceedToMessage} className="flex-1">
                        Próximo Passo
                      </MagicButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                     key="step4"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-6"
                  >
                     <div className="text-center border-b border-gold/20 pb-6 mb-6">
                      <h3 className="text-2xl font-cinzel text-ruby-dark uppercase tracking-widest">
                        {willAttend === false ? "Mensagem para Marcelle" : "Recado para Marcelle"}
                      </h3>
                      <p className="text-royal-light text-sm mt-2">Deixe uma mensagem especial (opcional).</p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative group">
                        <label className="text-xs font-cinzel text-gold-dark mb-2 block tracking-widest">Recado para Marcelle</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="ESCREVA SEU RECADO AQUI..."
                          rows={3}
                          className="w-full bg-white border-2 border-gold/30 rounded-lg p-4 text-royal-dark font-serif focus:outline-none focus:border-gold transition-all resize-none"
                        />
                      </div>

                      {willAttend !== false && (
                        <div className="relative group">
                          <label className="text-xs font-cinzel text-gold-dark mb-2 block tracking-widest">Sugestão de Música (Peça sua favorita!)</label>
                          <input
                            type="text"
                            value={musicSuggestion}
                            onChange={(e) => setMusicSuggestion(e.target.value)}
                            placeholder="NOME DA MÚSICA / ARTISTA"
                            className="w-full bg-white border-2 border-gold/30 rounded-lg px-4 py-3 text-royal-dark font-serif focus:outline-none focus:border-gold transition-all uppercase text-sm"
                          />
                        </div>
                      )}

                      <div className="relative group">
                        <label className="text-xs font-cinzel text-gold-dark mb-2 block tracking-widest">
                          {willAttend === false ? "E-mail para Contato" : "E-mail para envio dos QR Codes"}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="SEU@EMAIL.COM"
                          className="w-full bg-white border-2 border-gold/30 rounded-lg px-4 py-3 text-royal-dark font-serif focus:outline-none focus:border-gold transition-all uppercase text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          if (willAttend === false) {
                            setStep(2);
                          } else {
                            setStep(3);
                          }
                        }}
                        className="flex-1 py-3 text-royal-light hover:text-royal-dark font-cinzel text-sm cursor-pointer"
                      >
                        Voltar
                      </button>
                      <MagicButton onClick={handleSubmitRSVP} disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : (willAttend === false ? "Enviar Resposta" : "Finalizar Confirmação")}
                      </MagicButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-ruby text-center text-sm font-serif bg-ruby/10 p-3 rounded-lg border border-ruby/20 flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16}/>
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Animação clássica de fogos de artifício estilo abertura da Disney
function DisneyFireworks() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = (canvas.width = window.innerWidth);
      height = (canvas.height = window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#FFD700", // Gold
      "#FF69B4", // Hot Pink
      "#00FFFF", // Cyan
      "#FF4500", // OrangeRed
      "#9400D3", // Dark Violet
      "#00FF00", // Lime
      "#FFFF00", // Yellow
      "#FF1493", // Deep Pink
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 6 + 1.5;
        this.friction = 0.95;
        this.gravity = 0.1;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }

      update() {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
      }
    }

    class DisneyArc {
      constructor() {
        this.t = 0;
        this.speed = 0.008;
        this.trail = [];
        this.p0 = { x: width * 0.15, y: height * 0.9 };
        this.p1 = { x: width * 0.5, y: height * 0.1 };
        this.p2 = { x: width * 0.85, y: height * 0.9 };
        this.color = "#FFD700";
      }

      draw() {
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const opacity = i / this.trail.length;
          ctx.save();
          ctx.globalAlpha = opacity * 0.8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.color;
          ctx.fill();
          ctx.restore();

          if (Math.random() < 0.15) {
            sparkles.push({
              x: pt.x,
              y: pt.y,
              vx: (Math.random() - 0.5) * 1,
              vy: Math.random() * 1.5 + 0.5,
              alpha: 1,
              decay: 0.02,
            });
          }
        }
      }

      update() {
        if (this.t <= 1) {
          const x = (1 - this.t) * (1 - this.t) * this.p0.x + 2 * (1 - this.t) * this.t * this.p1.x + this.t * this.t * this.p2.x;
          const y = (1 - this.t) * (1 - this.t) * this.p0.y + 2 * (1 - this.t) * this.t * this.p1.y + this.t * this.t * this.p2.y;
          
          this.trail.push({ x, y });
          if (this.trail.length > 30) this.trail.shift();
          
          this.t += this.speed;

          if (Math.abs(this.t - 0.5) < 0.01 && Math.random() < 0.5) {
            spawnExplosion(x, y);
          }
        } else {
          this.trail.shift();
        }
      }

      isFinished() {
        return this.t >= 1 && this.trail.length === 0;
      }
    }

    class Rocket {
      constructor() {
        this.x = Math.random() * (width * 0.7) + width * 0.15;
        this.y = height;
        this.targetY = Math.random() * (height * 0.45) + height * 0.15;
        this.speed = Math.random() * 5 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.trail = [];
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for (let i = this.trail.length - 1; i >= 0; i--) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.restore();
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        this.y -= this.speed;
        this.speed *= 0.99;
      }

      isExploded() {
        return this.y <= this.targetY || this.speed < 1;
      }
    }

    let sparkles = [];
    let particles = [];
    let rockets = [];
    let disneyArc = new DisneyArc();
    let frame = 0;

    const spawnExplosion = (x, y, forcedColor = null) => {
      const color = forcedColor || colors[Math.floor(Math.random() * colors.length)];
      const numParticles = Math.floor(Math.random() * 40) + 60;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(x, y, color));
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 9, 26, 0.22)";
      ctx.fillRect(0, 0, width, height);

      if (disneyArc) {
        disneyArc.update();
        disneyArc.draw();
        if (disneyArc.isFinished()) {
          disneyArc = null;
        }
      }

      frame++;
      if (frame % 45 === 0) {
        rockets.push(new Rocket());
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.isExploded()) {
          spawnExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#FFD700";
        ctx.fill();
        ctx.restore();

        if (s.alpha <= 0) sparkles.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
