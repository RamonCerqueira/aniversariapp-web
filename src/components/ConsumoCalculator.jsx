import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '../services/api.js';
import { 
  ArrowLeft, 
  Flame, 
  CupSoda, 
  ShoppingBag, 
  Beer, 
  UtensilsCrossed, 
  Users,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Scale,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ConsumoCalculator({ onBack }) {
  const [inputs, setInputs] = useState({
    men: '10',
    women: '10',
    children: '5',
    beerDrinkers: '12',
  });

  const [results, setResults] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const calculateConsumo = (e) => {
    e.preventDefault();
    const m = parseInt(inputs.men) || 0;
    const w = parseInt(inputs.women) || 0;
    const c = parseInt(inputs.children) || 0;
    const bd = parseInt(inputs.beerDrinkers) || 0;

    // Métricas por pessoa (evento médio de 5 horas)
    // Carnes
    const meatMen = m * 400; // 400g
    const meatWomen = w * 300; // 300g
    const meatChildren = c * 200; // 200g
    const totalMeatGrams = meatMen + meatWomen + meatChildren;
    const totalMeatKg = totalMeatGrams / 1000;

    // Divisão de carnes (50% bovina, 30% suína/linguiça, 20% frango)
    const beefKg = totalMeatKg * 0.5;
    const porkKg = totalMeatKg * 0.3;
    const chickenKg = totalMeatKg * 0.2;

    // Bebidas
    const beerLiters = bd * 1.5; // 1.5L de cerveja por adulto que bebe (~4 latas de 350ml)
    const beerCans = Math.ceil((beerLiters * 1000) / 350);

    const totalPeople = m + w + c;
    const sodaLiters = Math.ceil((totalPeople * 400) / 1000); // 400ml por pessoa
    const waterLiters = Math.ceil((totalPeople * 300) / 1000); // 300ml por pessoa

    // Acompanhamentos ajustados para serem realistas (acaba com o "churrasco de pão de alho"!)
    const garlicBread = Math.ceil((m + w) * 1.2 + c * 0.8); // 1.2 por adulto, 0.8 por criança
    const garlicBreadPacks = Math.ceil(garlicBread / 5); // Geralmente vêm 5 no pacote
    const coalBags = Math.ceil(totalMeatKg / 6); // 1 saco de 5kg para cada 6kg de carne
    const grossSaltKg = (totalMeatKg * 0.04).toFixed(1); // 40g de sal por kg de carne

    setResults({
      beefKg: beefKg.toFixed(1),
      porkKg: porkKg.toFixed(1),
      chickenKg: chickenKg.toFixed(1),
      totalMeatKg: totalMeatKg.toFixed(1),
      beerCans,
      sodaLiters,
      waterLiters,
      garlicBread,
      garlicBreadPacks,
      coalBags,
      grossSaltKg,
    });
    
    // Limpa conselho de IA anterior para recalcular sob demanda e redefine para visão geral
    setAiAdvice(null);
    setActiveTab('overview');
  };

  const steps = [
    {
      title: "Despejando o carvão...",
      desc: "Selecionando o melhor carvão vegetal de eucalipto para criar uma brasa forte e duradoura.",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center bg-zinc-900/50 rounded-full border border-border/20">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -45, opacity: 0, rotate: 0 }}
              animate={{ y: 15, opacity: 1, rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.25 }}
              className="absolute w-5 h-5 bg-zinc-800 border border-zinc-700/80 rounded-md shadow-inner"
              style={{ left: `${20 + i * 12}%`, top: 15 }}
            />
          ))}
          <div className="absolute bottom-5 w-16 h-4 bg-zinc-950 border border-zinc-800 rounded-lg" />
        </div>
      )
    },
    {
      title: "Acendendo o fogo...",
      desc: "Soprando a brasa para atingir a temperatura ideal. O calor está subindo!",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center bg-amber-950/20 rounded-full border border-amber-500/10">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [15, -40], 
                x: [0, Math.sin(i) * 15, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5] 
              }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{ 
                left: `${35 + Math.random() * 30}%`, 
                bottom: 25,
                backgroundColor: i % 2 === 0 ? '#F59E0B' : '#EF4444' 
              }}
            />
          ))}
          <Flame size={48} className="text-amber-500 fill-amber-500/20 animate-bounce-slow stroke-[1.5]" />
        </div>
      )
    },
    {
      title: "Escolhendo os cortes premium...",
      desc: "Selecionando Picanha marmorizada, Fraldinha macia e cortes especiais Celebrate!.",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center bg-rose-950/20 rounded-full border border-rose-500/10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" className="w-16 h-16 text-rose-500 fill-rose-500/10 stroke-rose-500">
              <path d="M 20,40 C 15,20 45,10 70,25 C 90,35 95,65 80,80 C 65,95 35,95 25,80 C 15,70 25,60 20,40 Z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 40,30 C 45,35 35,45 40,55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,3" />
              <path d="M 60,35 C 65,45 55,55 60,65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,3" />
              <path d="M 75,70 C 70,75 75,80 80,75 C 85,70 80,65 75,70 Z" fill="white" stroke="currentColor" strokeWidth="2" />
            </svg>
          </motion.div>
          <Sparkles size={20} className="absolute top-4 right-4 text-yellow-400 fill-yellow-400 animate-pulse" />
        </div>
      )
    },
    {
      title: "Temperando com sal grosso...",
      desc: "Massageando as carnes com sal grosso especial para ressaltar a suculência natural.",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center bg-zinc-800/40 rounded-full border border-border/20">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -25, opacity: 0 }}
              animate={{ y: 25, opacity: [0, 1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.08 }}
              className="absolute w-1.5 h-1.5 bg-white rounded-sm border border-zinc-300"
              style={{ left: `${25 + (i * 7) % 50}%` }}
            />
          ))}
          <svg viewBox="0 0 100 100" className="w-14 h-14 text-zinc-400 fill-zinc-400/10 stroke-zinc-400">
            <path d="M 20,40 C 15,20 45,10 70,25 C 90,35 95,65 80,80 C 65,95 35,95 25,80 C 15,70 25,60 20,40 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
          </svg>
        </div>
      )
    },
    {
      title: "Grelhando e defumando...",
      desc: "As carnes estão na brasa quente, selando e criando aquele aroma irresistível de fumaça.",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center bg-amber-950/30 rounded-full border border-amber-500/20">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [10, -45], 
                x: [0, (i % 2 === 0 ? 8 : -8), 0],
                opacity: [0, 0.7, 0],
                scale: [0.8, 1.3]
              }}
              transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.4 }}
              className="absolute text-zinc-500/50 font-black text-2xl"
              style={{ bottom: 25, left: `${30 + i * 11}%` }}
            >
              ~
            </motion.div>
          ))}
          <div className="absolute w-16 h-1 bg-zinc-700/80 rounded-full bottom-8 border border-zinc-600/40" />
          <Flame size={32} className="text-amber-500 fill-amber-500/10 stroke-[1.5] mb-2" />
        </div>
      )
    }
  ];

  const fetchAiAdvice = async () => {
    console.log("=== INICIANDO FETCH AI ADVICE ===");
    console.log("Inputs atuais:", inputs);
    
    setIsGeneratingAi(true);
    setLoadingStep(0);

    // Inicia cronômetro visual dos passos
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      console.log(`Incrementando passo da animação para: ${currentStep}`);
      if (currentStep <= 4) {
        setLoadingStep(currentStep);
      } else {
        clearInterval(timer);
      }
    }, 1300);

    const startTime = Date.now();
    let success = false;
    let apiData = null;
    let apiError = null;

    try {
      console.log("1. Testando conectividade com o backend em http://localhost:3101/health...");
      try {
        const healthCheck = await fetch("http://localhost:3101/health");
        console.log("Status de saúde do backend:", healthCheck.status);
      } catch (err) {
        console.error("ALERTA: O backend não pôde ser alcançado em http://localhost:3101!", err);
      }

      console.log("2. Chamando api.ai.getChurrascoAdvice...");
      apiData = await api.ai.getChurrascoAdvice({
        men: inputs.men,
        women: inputs.women,
        children: inputs.children,
        beerDrinkers: inputs.beerDrinkers
      });
      console.log("3. Resposta da API recebida com sucesso:", apiData);
      success = true;
    } catch (error) {
      console.error("ERRO CRÍTICO NA CHAMADA DA API:", error);
      apiError = error;
    }

    // Garante que o usuário assista a pelo menos 5.5 segundos do processo artesanal do Chef
    const elapsedTime = Date.now() - startTime;
    const minDuration = 5500;
    const delay = Math.max(0, minDuration - elapsedTime);
    console.log(`Tempo decorrido da API: ${elapsedTime}ms. Aplicando delay restante: ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));
    clearInterval(timer);
    setIsGeneratingAi(false);
    console.log("Finalizando estado isGeneratingAi.");

    if (success && apiData) {
      setAiAdvice(apiData);
      toast.success("Cardápio Gourmet gerado pelo Gemini! 🍖", { position: "top-center" });
      setActiveTab('chef');
    } else {
      console.error("Exibindo toast de erro para o usuário:", apiError);
      toast.error(apiError?.message || "Ocorreu um erro ao consultar o Gemini.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300 relative overflow-hidden text-left">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />

      {/* Header Container */}
      <div className="relative z-10 pt-10 pb-10 px-6 border-b border-border/40 shadow-sm overflow-hidden">
        {/* Subtle Background Image & Texture */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-[0.08] mix-blend-multiply dark:mix-blend-lighten dark:opacity-[0.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/95 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none z-0" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-foreground hover:bg-muted rounded-full w-10 h-10 border border-border/50 bg-background/50 backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
            </Button>
          </motion.div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full">
            <Flame size={16} strokeWidth={2.5} className="text-primary" />
            <h1 className="text-[10px] font-black uppercase tracking-widest text-primary">Calculadora</h1>
          </div>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-3xl mx-auto mt-6 text-center z-10 relative">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-foreground"
          >
            Churrascômetro Gourmet
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-sm font-semibold text-muted-foreground max-w-lg mx-auto"
          >
            Evite desperdício! Calcule carnes, acompanhamentos e bebidas baseados no número real de convidados e ative a IA para dicas exclusivas de cortes.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Lado Esquerdo (4 cols): Entrada de Dados e Ativação da IA */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <Card className="shadow-lg border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
                <Users size={18} className="text-primary" /> Convidados
              </CardTitle>
              <CardDescription className="text-xs">Configure o perfil dos seus participantes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateConsumo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="input-men" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Homens</Label>
                    <Input
                      id="input-men"
                      type="number"
                      min="0"
                      value={inputs.men}
                      onChange={(e) => setInputs({ ...inputs, men: e.target.value })}
                      required
                      className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-4 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="input-women" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mulheres</Label>
                    <Input
                      id="input-women"
                      type="number"
                      min="0"
                      value={inputs.women}
                      onChange={(e) => setInputs({ ...inputs, women: e.target.value })}
                      required
                      className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-4 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="input-children" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Crianças</Label>
                    <Input
                      id="input-children"
                      type="number"
                      min="0"
                      value={inputs.children}
                      onChange={(e) => setInputs({ ...inputs, children: e.target.value })}
                      required
                      className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-4 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="input-beer" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bebem Cerveja</Label>
                    <Input
                      id="input-beer"
                      type="number"
                      min="0"
                      value={inputs.beerDrinkers}
                      onChange={(e) => setInputs({ ...inputs, beerDrinkers: e.target.value })}
                      required
                      className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-4 text-sm"
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                  <Button type="submit" className="w-full py-5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider shadow-md shadow-primary/10 cursor-pointer">
                    <Flame size={14} className="animate-pulse text-yellow-300 fill-yellow-300" /> Calcular
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          {/* SLIM IA CTA CARD */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card className="shadow-md border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.04] to-orange-500/[0.04] rounded-2xl overflow-hidden p-4 relative">
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-amber-500/5 rounded-full blur-[30px] pointer-events-none" />
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1 text-left">
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                      <Sparkles size={8} className="fill-amber-500" /> Chef Celebrate!
                    </span>
                    <h4 className="text-xs font-black text-foreground tracking-tight">Cortes & Harmonizações</h4>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      {aiAdvice ? "Menu do Chef liberado na aba ao lado!" : "Consulte a IA para refinar seu menu."}
                    </p>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                    <Button 
                      onClick={fetchAiAdvice} 
                      disabled={isGeneratingAi}
                      size="sm"
                      className="py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-[9px] uppercase tracking-widest px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-amber-500/15"
                    >
                      {isGeneratingAi ? (
                        <>
                          <Loader2 className="animate-spin h-3 w-3" />
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={10} className="text-white fill-white animate-pulse" />
                          <span>{aiAdvice ? "Recriar" : "Ativar IA"}</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Lado Direito (8 cols): Event Dashboard Unificado em Abas */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="event-dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-xl border border-border/40 bg-card/85 backdrop-blur-md rounded-3xl overflow-hidden p-6 space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 pb-4 text-left">
                    <div>
                      <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" /> Painel do Churrasco
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estimativa de insumos para {(parseInt(inputs.men) || 0) + (parseInt(inputs.women) || 0) + (parseInt(inputs.children) || 0)} convidados.
                      </p>
                    </div>
                    {/* Minimalist demography pills */}
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                      <span className="bg-muted px-2.5 py-1 rounded-full">{inputs.men} H</span>
                      <span className="bg-muted px-2.5 py-1 rounded-full">{inputs.women} M</span>
                      <span className="bg-muted px-2.5 py-1 rounded-full">{inputs.children} C</span>
                      <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/10">{inputs.beerDrinkers} Bebem</span>
                    </div>
                  </div>

                  {/* Segmented Pill Tabs Navigation */}
                  <div className="flex flex-wrap border-b border-border/20 bg-zinc-900/10 dark:bg-zinc-950/20 p-1 rounded-xl gap-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        activeTab === 'overview'
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <TrendingUp size={12} className={activeTab === 'overview' ? "text-primary" : ""} />
                      <span>Geral</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('meats')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        activeTab === 'meats'
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <UtensilsCrossed size={12} className={activeTab === 'meats' ? "text-primary" : ""} />
                      <span>Cortes</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('drinks')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        activeTab === 'drinks'
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <CupSoda size={12} className={activeTab === 'drinks' ? "text-primary" : ""} />
                      <span>Bebidas</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('chef')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer relative ${
                        activeTab === 'chef'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm'
                          : 'text-muted-foreground hover:text-amber-500/80'
                      }`}
                    >
                      <Sparkles size={12} className={activeTab === 'chef' ? "text-amber-500 fill-amber-500/10 animate-pulse" : ""} />
                      <span>Chef IA</span>
                      {aiAdvice && activeTab !== 'chef' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                      )}
                    </button>
                  </div>

                  {/* Tab Panes content area */}
                  <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                      {activeTab === 'overview' && (
                        <motion.div
                          key="tab-overview"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6 text-left"
                        >
                          {/* 3-column quick metric KPIs */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                            {/* Meat Overview Card */}
                            <div className="bg-muted/30 border border-border/20 p-4.5 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300 text-left">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Carnes</span>
                                <UtensilsCrossed size={16} className="text-primary" />
                              </div>
                              <div className="mt-4">
                                <h4 className="text-2xl font-black text-foreground leading-none">{results.totalMeatKg} <span className="text-xs font-bold text-muted-foreground uppercase">kg</span></h4>
                                <p className="text-[9px] text-muted-foreground font-semibold mt-1">Peso total calculado</p>
                              </div>
                              
                              {/* Segmented multi-color progress bar */}
                              <div className="mt-4 space-y-2">
                                <div className="h-2 w-full rounded-full overflow-hidden flex bg-muted/65">
                                  <div className="bg-primary h-full transition-all duration-300" style={{ width: '50%' }} title="Bovina" />
                                  <div className="bg-secondary h-full transition-all duration-300" style={{ width: '30%' }} title="Suína" />
                                  <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: '20%' }} title="Frango" />
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-muted-foreground tracking-wider uppercase">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {results.beefKg}kg Boi</span>
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {results.porkKg}kg Porco</span>
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {results.chickenKg}kg Frango</span>
                                </div>
                              </div>
                            </div>

                            {/* Drinks Overview Card */}
                            <div className="bg-muted/30 border border-border/20 p-4.5 rounded-2xl flex flex-col justify-between hover:border-secondary/20 transition-all duration-300 text-left">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Bebidas</span>
                                <CupSoda size={16} className="text-secondary" />
                              </div>
                              <div className="mt-4">
                                <h4 className="text-2xl font-black text-foreground leading-none">{results.beerCans} <span className="text-xs font-bold text-muted-foreground uppercase">latas</span></h4>
                                <p className="text-[9px] text-muted-foreground font-semibold mt-1">Cerveja recomendada</p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-border/10 flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase">
                                <span>🥤 Refri: <strong>{results.sodaLiters} L</strong></span>
                                <span>💧 Água: <strong>{results.waterLiters} L</strong></span>
                              </div>
                            </div>

                            {/* Accessories Overview Card */}
                            <div className="bg-muted/30 border border-border/20 p-4.5 rounded-2xl flex flex-col justify-between hover:border-accent/20 transition-all duration-300 text-left">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Acompanhamentos</span>
                                <ShoppingBag size={16} className="text-accent" />
                              </div>
                              <div className="mt-4">
                                <h4 className="text-2xl font-black text-foreground leading-none">{results.garlicBread} <span className="text-xs font-bold text-muted-foreground uppercase">un</span></h4>
                                <p className="text-[9px] text-muted-foreground font-semibold mt-1">Pão de Alho ({results.garlicBreadPacks} pacotes)</p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-border/10 flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase">
                                <span>⚫ Carvão: <strong>{results.coalBags} sacos</strong></span>
                                <span>🧂 Sal: <strong>{results.grossSaltKg} kg</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive bottom advice teaser banner */}
                          <div className="bg-muted/20 border border-border/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            {aiAdvice ? (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                    <Sparkles size={14} className="fill-amber-500/10" />
                                  </div>
                                  <div className="text-left">
                                    <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-500">Dica do Mestre Assador</h5>
                                    <p className="text-[11px] text-zinc-300 font-semibold italic mt-0.5 leading-snug line-clamp-1">
                                      "{aiAdvice.grillingTips}"
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('chef')}
                                  className="text-xs font-black uppercase text-amber-500 hover:text-amber-400 shrink-0 cursor-pointer flex items-center gap-1 transition-colors duration-200 bg-transparent border-0"
                                >
                                  Ler Mentoria Completa →
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                                  Deseja refinar este menu com cortes nobres e harmonizações do Chef?
                                </span>
                                <button
                                  type="button"
                                  onClick={fetchAiAdvice}
                                  className="text-xs font-black uppercase text-amber-500 hover:text-amber-400 cursor-pointer flex items-center gap-1 transition-colors duration-200 bg-transparent border-0"
                                >
                                  Chamar Chef IA →
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'meats' && (
                        <motion.div
                          key="tab-meats"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3 text-left"
                        >
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border/10 pb-2 flex justify-between">
                            <span>Ingrediente</span>
                            <span>Quantidade Recomendada</span>
                          </h4>
                          
                          {/* Tabular meat & supplies list rows */}
                          <div className="space-y-2 text-left">
                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-primary/20 transition-all duration-300">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><UtensilsCrossed size={14} /></span>
                                <div>
                                  <p className="font-extrabold text-xs">Carne Bovina Estimada</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Picanha, Contrafilé, Fraldinha</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-foreground bg-primary/10 text-primary px-3 py-1 rounded-full">{results.beefKg} kg</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-secondary/20 transition-all duration-300">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center"><UtensilsCrossed size={14} /></span>
                                <div>
                                  <p className="font-extrabold text-xs">Carne Suína / Embutidos</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Linguiça Toscana, Costelinha, Pancetta</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-foreground bg-secondary/10 text-secondary px-3 py-1 rounded-full">{results.porkKg} kg</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-accent/20 transition-all duration-300">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><UtensilsCrossed size={14} /></span>
                                <div>
                                  <p className="font-extrabold text-xs">Cortes de Frango</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Tulipas, Coxinhas da asa selecionadas</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-foreground bg-accent/10 text-accent px-3 py-1 rounded-full">{results.chickenKg} kg</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-border/30 transition-all duration-300">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold">🥖</span>
                                <div>
                                  <p className="font-extrabold text-xs">Pão de Alho Especial</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Geralmente {results.garlicBreadPacks} pacotes com 5 unidades</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-foreground bg-muted border px-3 py-1 rounded-full">{results.garlicBread} un</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-border/30 transition-all duration-300">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold">⚫</span>
                                <div>
                                  <p className="font-extrabold text-xs">Carvão Vegetal</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Sacos de 5kg recomendados para brasa forte</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-foreground bg-muted border px-3 py-1 rounded-full">{results.coalBags} sacos</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-border/30 transition-all duration-300">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold">🧂</span>
                                <div>
                                  <p className="font-extrabold text-xs">Sal Grosso / Sal de Parrilla</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Para tempero exato antes de colocar na grelha</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-foreground bg-muted border px-3 py-1 rounded-full">{results.grossSaltKg} kg</strong>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'drinks' && (
                        <motion.div
                          key="tab-drinks"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 text-left"
                        >
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border/10 pb-2 flex justify-between">
                            <span>Bebida</span>
                            <span>Volume / Quantidade</span>
                          </h4>

                          <div className="space-y-2 text-left">
                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-amber-500/20 transition-all duration-300 text-left">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Beer size={14} /></span>
                                <div>
                                  <p className="font-extrabold text-xs">Cerveja Gelada (350ml)</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Consumo estimado de 1.5L por adulto bebedor</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">{results.beerCans} latas</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-secondary/20 transition-all duration-300 text-left">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center"><CupSoda size={14} /></span>
                                <div>
                                  <p className="font-extrabold text-xs">Refrigerantes & Sucos</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Estimativa geral de 400ml por convidado</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full">{results.sodaLiters} Litros</strong>
                            </div>

                            <div className="flex justify-between items-center bg-muted/25 px-4 py-3 rounded-xl border border-border/10 hover:border-accent/20 transition-all duration-300 text-left">
                              <span className="flex items-center gap-3 font-semibold text-xs text-foreground/90">
                                <span className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><CupSoda size={14} /></span>
                                <div>
                                  <p className="font-extrabold text-xs">Água Mineral</p>
                                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Essencial para hidratação durante o churrasco</p>
                                </div>
                              </span>
                              <strong className="text-xs font-black text-accent bg-accent/10 px-3 py-1 rounded-full">{results.waterLiters} Litros</strong>
                            </div>
                          </div>

                          <div className="bg-muted/15 border border-border/10 p-3.5 rounded-xl text-left">
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">💡 Dica do Barman</h5>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-1 leading-relaxed">
                              Recomendação de Gelo: Compre pelo menos 1 saco de gelo de 5kg para cada 15 latas de cerveja + refrigerantes. Coloque as bebidas sob gelo pelo menos 3 horas antes do início para estarem perfeitamente trincando!
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'chef' && (
                        <motion.div
                          key="tab-chef"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          {aiAdvice ? (
                            <div className="space-y-5 text-left">
                              {/* Elite speech bubble card */}
                              <div className="bg-zinc-950/45 dark:bg-zinc-950/70 border border-amber-500/20 p-4.5 rounded-2xl relative overflow-hidden text-left animate-fade-in">
                                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-500/5 rounded-full blur-[45px] pointer-events-none" />
                                <div className="flex gap-3 items-start relative z-10">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                                    <Flame size={16} className="animate-pulse" />
                                  </div>
                                  <div className="space-y-1 flex-1">
                                    <h5 className="text-[9px] font-black uppercase tracking-wider text-amber-500">Conselho do Mestre Churrasqueiro</h5>
                                    <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-semibold italic whitespace-pre-line text-left">
                                      "{aiAdvice.grillingTips}"
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Meat Cuts and Sides Recommendations list */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                {/* Premium Cuts */}
                                <div className="space-y-3 text-left">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 border-b border-amber-500/10 pb-1 flex items-center gap-1.5">
                                    <UtensilsCrossed size={12} /> Cortes Premium do Chef
                                  </h5>
                                  <div className="space-y-2.5">
                                    {aiAdvice.meatSuggestions?.map((item, idx) => (
                                      <div key={idx} className="bg-muted/20 border border-border/10 p-3.5 rounded-xl hover:border-amber-500/15 transition-all duration-300">
                                        <div className="flex justify-between items-baseline gap-2">
                                          <span className="font-extrabold text-foreground text-xs">{item.cut}</span>
                                          <span className="font-black text-[10px] text-amber-500 shrink-0 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md text-right">{item.quantity}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1 whitespace-pre-line text-left">
                                          {item.reason}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Premium Sides */}
                                <div className="space-y-3 text-left">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-500 border-b border-orange-500/10 pb-1 flex items-center gap-1.5">
                                    <ShoppingBag size={12} /> Guarnições & Toque Final
                                  </h5>
                                  <div className="space-y-2.5">
                                    {aiAdvice.sidesSuggestions?.map((item, idx) => (
                                      <div key={idx} className="bg-muted/20 border border-border/10 p-3.5 rounded-xl hover:border-orange-500/15 transition-all duration-300">
                                        <div className="flex justify-between items-baseline gap-2">
                                          <span className="font-extrabold text-foreground text-xs">{item.side}</span>
                                          <span className="font-black text-[10px] text-orange-500 shrink-0 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md text-right">{item.quantity}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1 whitespace-pre-line text-left">
                                          <strong className="text-orange-500/90 uppercase tracking-wider text-[8px] mr-1.5 bg-orange-500/10 px-1.5 py-0.5 rounded-md">Segredo do Chef:</strong>
                                          {item.tip}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* IA Advice NOT yet generated */
                            <div className="flex flex-col justify-center items-center py-8 text-center space-y-4">
                              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-500 animate-bounce-slow">
                                <Sparkles size={20} className="fill-amber-500/10" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-foreground">Liberar Mentoria do Chef Assador</h4>
                                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                                  Ative a inteligência artificial para que nosso Chef crie uma sequência de cortes de altíssimo nível e compartilhe técnicas profissionais de brasa.
                                </p>
                              </div>
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="pt-2">
                                <Button 
                                  onClick={fetchAiAdvice} 
                                  disabled={isGeneratingAi}
                                  className="py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-[9px] uppercase tracking-widest px-5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/15"
                                >
                                  {isGeneratingAi ? (
                                    <>
                                      <Loader2 className="animate-spin h-3 w-3" />
                                      <span>Consultando Chef...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={11} className="text-white fill-white animate-pulse" />
                                      <span>Ativar Inteligência do Chef</span>
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ) : (
              /* No results calculated yet */
              <motion.div
                key="empty-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-dashed border-2 border-border/60 p-12 text-center bg-card/30 rounded-3xl shadow-inner">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 border border-border/30 text-muted-foreground/50">
                    <Flame size={30} className="text-primary animate-pulse" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground/90">Faça sua estimativa inteligente</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                    Utilizamos modelos de estimativa baseados em taxas de consumo brasileiras recomendadas, eliminando desperdício e otimizando seu orçamento.
                  </p>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 border px-3 py-1 rounded-full flex items-center gap-1"><Sparkles size={11} className="text-secondary" /> Sem Desperdício</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 border px-3 py-1 rounded-full flex items-center gap-1"><TrendingUp size={11} className="text-primary" /> Otimização Real</span>
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
