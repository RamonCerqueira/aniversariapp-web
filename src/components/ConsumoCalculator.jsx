import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '../services/api.js';
import { useParty } from '../contexts/PartyContext.jsx';
import {
  ArrowLeft, Flame, CupSoda, ShoppingBag, Beer,
  UtensilsCrossed, Users, Sparkles, TrendingUp, Scale,
  Loader2, Cake, Music, Baby, Heart, Star, Wine,
  MapPin, Phone, ChevronRight, Navigation, Calculator
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Tipos de festa disponíveis ───────────────────────────────────────────────
const PARTY_TYPES = [
  {
    id: 'churrasco',
    label: 'Churrasco',
    emoji: '🔥',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
    desc: 'Costela, picanha, linguiça'
  },
  {
    id: 'aniversario',
    label: 'Aniversário',
    emoji: '🎂',
    icon: Cake,
    color: 'from-primary to-secondary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
    desc: 'Bolo, salgados, doces'
  },
  {
    id: 'casamento',
    label: 'Casamento',
    emoji: '💍',
    icon: Heart,
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-500',
    desc: 'Buffet completo, mesa de frios'
  },
  {
    id: 'debutante',
    label: 'Debutante',
    emoji: '👑',
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
    desc: 'Mesa de doces, salgados finos'
  },
  {
    id: 'infantil',
    label: 'Infantil',
    emoji: '🎈',
    icon: Baby,
    color: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-500',
    desc: 'Docinhos, salgadinhos, bolo'
  },
  {
    id: 'formatura',
    label: 'Formatura',
    emoji: '🎓',
    icon: Music,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
    desc: 'Buffet, open bar'
  },
  {
    id: 'confraternizacao',
    label: 'Corporativo',
    emoji: '👔',
    icon: Users,
    color: 'from-blue-600 to-indigo-600',
    bg: 'bg-blue-600/10',
    border: 'border-blue-600/30',
    text: 'text-blue-600',
    desc: 'Confraternizações e eventos corporativos'
  },
  {
    id: 'outro',
    label: 'Outro / Geral',
    emoji: '🎉',
    icon: Sparkles,
    color: 'from-zinc-500 to-slate-500',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-500',
    desc: 'Reuniões, jantares e eventos gerais'
  }
];

// ─── Cálculos por tipo ─────────────────────────────────────────────────────────
function calcChurrasco(guests) {
  const { adults = 0, women = 0, children = 0, beerDrinkers = 0 } = guests;
  const totalMeatGrams = adults * 400 + women * 300 + children * 200;
  const totalMeatKg = totalMeatGrams / 1000;
  return {
    sections: [
      {
        title: '🥩 Carnes', color: 'text-orange-500', items: [
          { label: 'Carne Bovina (Picanha, Fraldinha)', qty: `${(totalMeatKg * 0.5).toFixed(1)} kg` },
          { label: 'Suína / Linguiça Toscana', qty: `${(totalMeatKg * 0.3).toFixed(1)} kg` },
          { label: 'Frango (Tulipas, Coxinha)', qty: `${(totalMeatKg * 0.2).toFixed(1)} kg` },
          { label: 'TOTAL DE CARNES', qty: `${totalMeatKg.toFixed(1)} kg`, bold: true },
        ]
      },
      {
        title: '🪵 Insumos', color: 'text-zinc-400', items: [
          { label: 'Carvão Vegetal (sacos 5kg)', qty: `${Math.ceil(totalMeatKg / 6)} sacos` },
          { label: 'Sal Grosso', qty: `${(totalMeatKg * 0.04).toFixed(1)} kg` },
          { label: 'Pão de Alho (unidades)', qty: `${Math.ceil((adults + women) * 1.2 + children * 0.8)} un` },
        ]
      }
    ]
  };
}

function calcBebidas(guests) {
  const { adults = 0, women = 0, children = 0, beerDrinkers = 0, hours = 4 } = guests;
  const total = adults + women + children;
  const h = Math.max(1, hours);
  const beerLiters = beerDrinkers * 1.5 * (h / 4);
  const beerCans = Math.ceil((beerLiters * 1000) / 350);
  const sodaLiters = Math.ceil(total * 0.4 * (h / 4));
  const waterLiters = Math.ceil(total * 0.3 * (h / 4));
  const juiceLiters = Math.ceil(children * 0.3 * (h / 4));
  const iceKg = Math.ceil((beerCans + sodaLiters * 2) / 8);
  const glassesWine = Math.ceil((adults + women) * 0.5 * (h / 4));
  return {
    beerCans, sodaLiters, waterLiters, juiceLiters, iceKg, glassesWine,
    sections: [
      {
        title: '🍺 Bebidas Alcoólicas', color: 'text-amber-500', items: [
          { label: `Cerveja 350ml (${beerDrinkers} bebem)`, qty: `${beerCans} latas` },
          { label: 'Vinho (taças aprox.)', qty: `${glassesWine} taças` },
        ]
      },
      {
        title: '🥤 Não Alcoólicas', color: 'text-sky-400', items: [
          { label: 'Refrigerante', qty: `${sodaLiters} L` },
          { label: 'Água Mineral', qty: `${waterLiters} L` },
          { label: 'Sucos / Néctar (crianças)', qty: `${juiceLiters} L` },
        ]
      },
      {
        title: '🧊 Logística', color: 'text-blue-400', items: [
          { label: 'Gelo (sacos 5kg aprox.)', qty: `${iceKg} sacos` },
          { label: 'Cooler/Caixa Térmica', qty: `${Math.ceil(iceKg / 2)} un` },
        ]
      }
    ]
  };
}

function calcFesta(guests, tipo) {
  const { adults = 0, women = 0, children = 0 } = guests;
  const total = adults + women + children;

  const configs = {
    aniversario: {
      salgados: Math.ceil(total * 15),
      doces: Math.ceil(total * 10),
      bolo: `${(total / 20).toFixed(1)} andares`,
      itensPorPessoa: [
        { label: 'Salgadinhos (coxinha, quibe, etc.)', qty: `${Math.ceil(total * 15)} un` },
        { label: 'Docinhos (brigadeiro, beijinho)', qty: `${Math.ceil(total * 10)} un` },
        { label: 'Bolo de Aniversário', qty: `${Math.ceil(total / 20)} andares` },
        { label: 'Fatias de bolo/pessoa', qty: '2 fatias p/ pessoa' },
        { label: 'Mini tortas / quiches', qty: `${Math.ceil(total * 2)} un` },
      ]
    },
    casamento: {
      itensPorPessoa: [
        { label: 'Canapés / Finger foods (entrada)', qty: `${Math.ceil(total * 8)} un` },
        { label: 'Pratos principais (buffet)', qty: `${Math.ceil(total * 1.2)} pratos` },
        { label: 'Mesa de frios (gramas/pessoa)', qty: `${total * 80}g total` },
        { label: 'Doces finos (mesa de doces)', qty: `${Math.ceil(total * 8)} un` },
        { label: 'Bolo de casamento (andares)', qty: `${Math.ceil(total / 30)} andares` },
        { label: 'Bem casados', qty: `${total} un` },
      ]
    },
    debutante: {
      itensPorPessoa: [
        { label: 'Salgadinhos finos', qty: `${Math.ceil(total * 12)} un` },
        { label: 'Doces finos / Macarons', qty: `${Math.ceil(total * 10)} un` },
        { label: 'Mesa de Candy Bar', qty: `${Math.ceil(total * 5)} itens` },
        { label: 'Bolo principal', qty: `${Math.ceil(total / 25)} andares` },
        { label: 'Mini bolos decorados', qty: `${Math.ceil(total / 5)} un` },
      ]
    },
    infantil: {
      itensPorPessoa: [
        { label: 'Salgadinhos (mini)', qty: `${Math.ceil(total * 20)} un` },
        { label: 'Docinhos (brigadeiro, etc.)', qty: `${Math.ceil(total * 15)} un` },
        { label: 'Bolo temático', qty: `${Math.ceil(total / 15)} andares` },
        { label: 'Papelinhos / Cachorro-quente', qty: `${Math.ceil(total * 1.5)} un` },
        { label: 'Pipoca / Algodão doce', qty: `${Math.ceil(total * 1)} porção` },
      ]
    },
    formatura: {
      itensPorPessoa: [
        { label: 'Entradas / Finger foods', qty: `${Math.ceil(total * 10)} un` },
        { label: 'Pratos quentes (buffet)', qty: `${Math.ceil(total * 1.5)} pratos` },
        { label: 'Sobremesas variadas', qty: `${Math.ceil(total * 3)} un` },
        { label: 'Mesa de frios', qty: `${total * 100}g total` },
        { label: 'Bolo de formatura', qty: `${Math.ceil(total / 25)} andares` },
      ]
    },
    confraternizacao: {
      itensPorPessoa: [
        { label: 'Mini sanduíches / Sliders', qty: `${Math.ceil(total * 3)} un` },
        { label: 'Canapés e salgadinhos finos', qty: `${Math.ceil(total * 10)} un` },
        { label: 'Tábua de Frios (queijos, salames, etc.)', qty: `${total * 80}g total` },
        { label: 'Doces finos / Sobremesas individuais', qty: `${Math.ceil(total * 4)} un` },
      ]
    },
    outro: {
      itensPorPessoa: [
        { label: 'Salgados tradicionais (fritos e assados)', qty: `${Math.ceil(total * 12)} un` },
        { label: 'Docinhos de festa', qty: `${Math.ceil(total * 6)} un` },
        { label: 'Tábua de Frios & Petiscos', qty: `${total * 60}g total` },
        { label: 'Bolo / Sobremesa', qty: `${Math.ceil(total * 1)} fatia/porção` },
      ]
    }
  };

  const cfg = configs[tipo] || configs.outro;
  return {
    sections: [
      {
        title: '🍽️ Comidas & Doces', color: 'text-primary',
        items: cfg.itensPorPessoa
      }
    ]
  };
}

// ─── Recommended Suppliers Widget ──────────────────────────────────────────────
const RecommendedSuppliersWidget = ({ suppliers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 animate-pulse flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 w-5 h-5 mr-2" />
        <span className="text-xs font-bold text-muted-foreground">Carregando parceiros recomendados Celebrate...</span>
      </div>
    );
  }
  if (!suppliers || suppliers.length === 0) return null;

  return (
    <div className="mt-8 space-y-3.5 border-t border-border/20 pt-6">
      <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
        <Sparkles size={12} className="fill-amber-500/20 text-amber-500" /> Parceiros Ouro Celebrate Recomendados
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {suppliers.map(s => (
          <div key={s.id} className="flex items-center gap-3.5 p-3.5 bg-gradient-to-br from-amber-500/[0.04] via-card to-primary/[0.03] border border-amber-500/15 rounded-2xl hover:shadow-md hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent px-2.5 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <Sparkles size={8} className="fill-amber-500" /> Destaque
            </div>
            <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-sm">
              {s.logo ? <img src={s.logo} className="w-full h-full object-cover" alt="Logo" /> : '💼'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-foreground truncate group-hover:text-primary transition-colors">{s.companyName}</p>
              <p className="text-[9px] text-muted-foreground font-bold mt-0.5">{s.city} · {s.category}</p>
            </div>
            <a href={`https://api.whatsapp.com/send?phone=${s.phone}`} target="_blank" rel="noreferrer"
              className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all duration-300 shrink-0">
              <Phone size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function ConsumoCalculator({ onBack }) {
  const { currentParty } = useParty();

  // Tipo de festa selecionado
  const [partyType, setPartyType] = useState(() => {
    if (currentParty?.type) {
      const typeMap = {
        'churrasco': 'churrasco',
        'festa_infantil': 'infantil',
        'festa_adulto': 'aniversario',
        'festa_tematica': 'outro',
        'confraternizacao': 'confraternizacao',
        'outro': 'outro'
      };
      return typeMap[currentParty.type] || 'churrasco';
    }
    return 'churrasco';
  });

  // Inputs de convidados
  const [guests, setGuests] = useState(() => {
    const total = currentParty?.guestCount || 25;
    const childrenCount = Math.round(total * 0.2);
    const remaining = total - childrenCount;
    const adultsCount = Math.round(remaining * 0.5);
    const womenCount = remaining - adultsCount;
    const beerDrinkersCount = Math.round((adultsCount + womenCount) * 0.6);

    return {
      adults: String(adultsCount || 10),
      women: String(womenCount || 10),
      children: String(childrenCount || 5),
      beerDrinkers: String(beerDrinkersCount || 12),
      hours: '4',
    };
  });

  // Resultados
  const [results, setResults] = useState(null);
  const [drinkResults, setDrinkResults] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState('food');

  // Fornecedores próximos
  const [nearbySuppliers, setNearbySuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const g = {
    adults: parseInt(guests.adults) || 0,
    women: parseInt(guests.women) || 0,
    children: parseInt(guests.children) || 0,
    beerDrinkers: parseInt(guests.beerDrinkers) || 0,
    hours: parseInt(guests.hours) || 4,
  };
  const totalGuests = g.adults + g.women + g.children;

  const getCategoryForPartyType = (type) => {
    switch (type) {
      case 'churrasco':
      case 'confraternizacao':
      case 'aniversario':
      case 'casamento':
      case 'debutante':
      case 'infantil':
      case 'formatura':
      default:
        return 'Buffet';
    }
  };

  const fetchSuggestedSuppliers = async (type = partyType) => {
    setIsLoadingSuppliers(true);
    try {
      const category = getCategoryForPartyType(type);
      const data = await api.suppliers.getAll({ recommendOnly: 'true', category });
      setNearbySuppliers(data.slice(0, 4));

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {}
        );
      }
    } catch (err) {
      console.error('Erro ao buscar fornecedores sugeridos:', err);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (totalGuests === 0) {
      toast.warning('Informe pelo menos 1 convidado.');
      return;
    }

    const drinkCalc = calcBebidas(g);
    setDrinkResults(drinkCalc);

    if (partyType === 'churrasco') {
      setResults(calcChurrasco(g));
    } else {
      setResults(calcFesta(g, partyType));
    }

    setAiAdvice(null);
    setActiveTab('food');
    toast.success(`Calculado para ${totalGuests} pessoas! 🎉`);
    
    // Background fetch Ouro suppliers
    fetchSuggestedSuppliers(partyType);
  };

  // IA Advice (apenas para churrasco)
  const fetchAiAdvice = async () => {
    setIsGeneratingAi(true);
    setLoadingStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step <= 4) setLoadingStep(step);
      else clearInterval(timer);
    }, 1300);

    const start = Date.now();
    try {
      const data = await api.ai.getChurrascoAdvice({
        men: guests.adults,
        women: guests.women,
        children: guests.children,
        beerDrinkers: guests.beerDrinkers
      });
      const elapsed = Date.now() - start;
      await new Promise(r => setTimeout(r, Math.max(0, 5500 - elapsed)));
      clearInterval(timer);
      setIsGeneratingAi(false);
      setAiAdvice(data);
      setActiveTab('chef');
      toast.success('Mentoria do Chef gerada pelo Gemini! 🍖');
    } catch (err) {
      clearInterval(timer);
      setIsGeneratingAi(false);
      toast.error(err?.message || 'Erro ao consultar IA.');
    }
  };

  // Fornecedores próximos
  const handleFindSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const data = await api.suppliers.getAll({});
      setNearbySuppliers(data.slice(0, 4));

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {}
        );
      }
      setActiveTab('suppliers');
      toast.success('Fornecedores carregados! 📍');
    } catch {
      toast.error('Não foi possível carregar fornecedores.');
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Tipo de festa selecionado
  const selectedType = PARTY_TYPES.find(t => t.id === partyType) || PARTY_TYPES[0];

  // Tabs disponíveis após calcular
  const tabs = [
    { id: 'food', label: partyType === 'churrasco' ? '🥩 Comidas' : '🍽️ Comidas', show: true },
    { id: 'drinks', label: '🍺 Bebidas', show: true },
    ...(partyType === 'churrasco' ? [{ id: 'chef', label: '✨ Chef IA', show: true }] : []),
    { id: 'suppliers', label: '📍 Fornecedores', show: true },
  ].filter(t => t.show);

  // Animações de loading do Chef
  const loadingSteps = [
    { title: 'Despejando o carvão...', icon: '🪵' },
    { title: 'Acendendo o fogo...', icon: '🔥' },
    { title: 'Escolhendo os cortes...', icon: '🥩' },
    { title: 'Temperando com sal grosso...', icon: '🧂' },
    { title: 'Grelhando e defumando...', icon: '🍖' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 transition-colors duration-300 relative overflow-hidden">

      {/* Mesh aurorais e orbs Celebrate Premium */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-amber-500/15 to-primary/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[-15%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-secondary/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-[100px] pointer-events-none z-0" />

      {/* ── HEADER ── */}
      <div className="relative z-10 pt-8 pb-8 px-4 md:px-6 border-b border-border/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-5">
          <Button variant="ghost" size="icon" onClick={onBack}
            className="rounded-full w-10 h-10 border border-border/50 bg-background/50 text-foreground hover:bg-muted">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full">
            <Calculator size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Calculadora</span>
          </div>
          <div className="w-10 h-10" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-black tracking-tight text-foreground"
          >
            Calculadora de Consumo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-2 text-xs sm:text-sm font-semibold text-muted-foreground max-w-lg mx-auto"
          >
            Calcule comidas, bebidas e encontre fornecedores para qualquer tipo de festa — sem desperdício!
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 relative z-10 space-y-6">

        {/* ── SELETOR DE TIPO DE FESTA ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Tipo de Evento</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {PARTY_TYPES.map(type => {
              const Icon = type.icon;
              const active = partyType === type.id;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setPartyType(type.id); setResults(null); setDrinkResults(null); setAiAdvice(null); }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    active
                      ? `${type.bg} ${type.border} shadow-md`
                      : 'bg-card border-border/40 hover:border-border'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{type.emoji}</span>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight text-center ${active ? type.text : 'text-muted-foreground'}`}>
                    {type.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── GRID PRINCIPAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Coluna de entrada (4 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-4 space-y-4"
          >
            <Card className={`shadow-lg border-2 ${selectedType.border} bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden`}>
              <div className={`h-1.5 bg-gradient-to-r ${selectedType.color}`} />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-foreground">
                  <Users size={16} className={selectedType.text} /> Convidados
                </CardTitle>
                <CardDescription className="text-[11px]">Configure o perfil dos participantes.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {partyType === 'infantil' ? 'Adultos' : 'Homens'}
                      </Label>
                      <Input type="number" min="0" value={guests.adults}
                        onChange={e => setGuests({ ...guests, adults: e.target.value })}
                        className="rounded-xl border-border/80 py-4 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {partyType === 'infantil' ? 'Mulheres' : 'Mulheres'}
                      </Label>
                      <Input type="number" min="0" value={guests.women}
                        onChange={e => setGuests({ ...guests, women: e.target.value })}
                        className="rounded-xl border-border/80 py-4 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Crianças</Label>
                      <Input type="number" min="0" value={guests.children}
                        onChange={e => setGuests({ ...guests, children: e.target.value })}
                        className="rounded-xl border-border/80 py-4 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bebem Cerveja</Label>
                      <Input type="number" min="0" value={guests.beerDrinkers}
                        onChange={e => setGuests({ ...guests, beerDrinkers: e.target.value })}
                        className="rounded-xl border-border/80 py-4 text-sm" />
                    </div>
                  </div>

                  {/* Horas do evento */}
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duração (horas)</Label>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6, 8].map(h => (
                        <button
                          key={h} type="button"
                          onClick={() => setGuests({ ...guests, hours: String(h) })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                            parseInt(guests.hours) === h
                              ? `${selectedType.bg} ${selectedType.border} ${selectedType.text}`
                              : 'border-border/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className={`w-full py-5 bg-gradient-to-r ${selectedType.color} hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md`}>
                      <Calculator size={14} />
                      Calcular para {totalGuests || '?'} pessoas
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>

            {/* CTA Fornecedores */}
            {results && (
              <Card className="border border-border/50 bg-card/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 mb-0.5">
                      <MapPin size={9} /> Fornecedores Próximos
                    </span>
                    <p className="text-xs font-extrabold text-foreground">Buffets, docerias e mais</p>
                    <p className="text-[10px] text-muted-foreground">Baseado na sua localização</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleFindSuppliers}
                    disabled={isLoadingSuppliers}
                    className="rounded-xl px-3 bg-primary text-primary-foreground text-[10px] font-black h-9 shrink-0"
                  >
                    {isLoadingSuppliers ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                  </Button>
                </div>
              </Card>
            )}

            {/* CTA Chef IA (só para churrasco) */}
            {results && partyType === 'churrasco' && (
              <Card className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1 mb-0.5">
                      <Sparkles size={9} className="fill-amber-500" /> Chef IA Celebrate!
                    </span>
                    <p className="text-xs font-extrabold text-foreground">Cortes & Harmonizações</p>
                    <p className="text-[10px] text-muted-foreground">{aiAdvice ? 'Menu gerado!' : 'Gemini AI'}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={fetchAiAdvice}
                    disabled={isGeneratingAi}
                    className="rounded-xl px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black h-9 shrink-0"
                  >
                    {isGeneratingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Coluna de resultados (8 cols) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {results ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="shadow-2xl shadow-primary/5 border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] via-card/90 to-primary/[0.03] backdrop-blur-xl rounded-3xl overflow-hidden">
                    {/* Header do painel */}
                    <div className={`h-1.5 bg-gradient-to-r ${selectedType.color}`} />
                    <div className="p-5 sm:p-6 border-b border-border/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-black text-foreground flex items-center gap-2">
                            <span className="text-xl">{selectedType.emoji}</span>
                            {selectedType.label} — {totalGuests} Pessoas
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{selectedType.desc} · {guests.hours}h de evento</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="bg-muted text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{guests.adults} H</span>
                          <span className="bg-muted text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{guests.women} M</span>
                          <span className="bg-muted text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{guests.children} C</span>
                          <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/10">{guests.beerDrinkers} Bebem</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="overflow-x-auto border-b border-border/20">
                      <div className="flex gap-1 p-2 min-w-max">
                        {tabs.map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                              activeTab === tab.id
                                ? `${selectedType.bg} ${selectedType.text} ${selectedType.border} border shadow-sm`
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conteúdo das tabs */}
                    <div className="p-5 sm:p-6 min-h-[320px]">
                      <AnimatePresence mode="wait">

                        {/* TAB: Comidas */}
                        {activeTab === 'food' && results && (
                          <motion.div key="food" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                            {results.sections.map((section, si) => (
                              <div key={si} className="space-y-2">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${section.color} border-b border-border/20 pb-1.5 flex justify-between`}>
                                  <span>{section.title}</span>
                                  <span className="text-muted-foreground">Quantidade</span>
                                </h4>
                                <div className="space-y-1.5">
                                  {section.items.map((item, ii) => (
                                    <div key={ii} className={`flex justify-between items-center px-4 py-3.5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                                      item.bold 
                                        ? 'bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/25 shadow-sm shadow-primary/5' 
                                        : 'bg-muted/30 border-border/40 hover:border-border'
                                    }`}>
                                      <span className={`text-xs font-bold text-foreground/90 ${item.bold ? 'font-black text-primary' : ''}`}>{item.label}</span>
                                      <span className={`text-xs font-black px-3.5 py-1.5 rounded-xl shrink-0 ml-2 shadow-inner ${
                                        item.bold 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-background border border-border/40 text-foreground'
                                      }`}>{item.qty}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Parceiros Recomendados Ouro */}
                            <RecommendedSuppliersWidget suppliers={nearbySuppliers} isLoading={isLoadingSuppliers} />
                          </motion.div>
                        )}

                        {/* TAB: Bebidas */}
                        {activeTab === 'drinks' && drinkResults && (
                          <motion.div key="drinks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                            {drinkResults.sections.map((section, si) => (
                              <div key={si} className="space-y-2">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${section.color} border-b border-border/20 pb-1.5 flex justify-between`}>
                                  <span>{section.title}</span>
                                  <span className="text-muted-foreground">Quantidade</span>
                                </h4>
                                <div className="space-y-1.5">
                                  {section.items.map((item, ii) => (
                                    <div key={ii} className="flex justify-between items-center px-4 py-3.5 rounded-2xl bg-muted/30 border border-border/40 hover:border-border hover:scale-[1.01] transition-all duration-300">
                                      <span className="text-xs font-bold text-foreground/90">{item.label}</span>
                                      <span className="text-xs font-black bg-background px-3.5 py-1.5 rounded-xl border border-border/40 shrink-0 ml-2 shadow-inner">{item.qty}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Dica de Gelo */}
                            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 flex gap-3">
                              <span className="text-xl shrink-0">🧊</span>
                              <div>
                                <p className="text-[10px] font-black text-sky-500 uppercase tracking-wider mb-1">💡 Dica do Barman</p>
                                <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                                  Coloque as bebidas sob gelo pelo menos 3 horas antes. 1 saco de gelo (5kg) para cada 15 latas + 5L de refrigerante.
                                </p>
                              </div>
                            </div>

                            {/* Parceiros Recomendados Ouro */}
                            <RecommendedSuppliersWidget suppliers={nearbySuppliers} isLoading={isLoadingSuppliers} />
                          </motion.div>
                        )}

                        {/* TAB: Chef IA (Churrasco) */}
                        {activeTab === 'chef' && (
                          <motion.div key="chef" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {isGeneratingAi ? (
                              <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
                                <div className="text-5xl">{loadingSteps[loadingStep]?.icon || '🔥'}</div>
                                <div className="space-y-2">
                                  <p className="text-sm font-black text-foreground">{loadingSteps[loadingStep]?.title || 'Processando...'}</p>
                                  <p className="text-[11px] text-muted-foreground">O Chef está preparando seu menu especial...</p>
                                </div>
                                <div className="flex gap-1.5">
                                  {loadingSteps.map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= loadingStep ? 'bg-amber-500' : 'bg-muted'}`} />
                                  ))}
                                </div>
                              </div>
                            ) : aiAdvice ? (
                              <div className="space-y-5">
                                <div className="bg-zinc-950/40 dark:bg-zinc-950/70 border border-amber-500/20 p-4 rounded-2xl relative overflow-hidden">
                                  <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                                      <Flame size={15} className="animate-pulse" />
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black uppercase tracking-wider text-amber-500 mb-1">Conselho do Mestre Churrasqueiro</p>
                                      <p className="text-xs text-zinc-300 leading-relaxed font-semibold italic">"{aiAdvice.grillingTips}"</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 border-b border-amber-500/10 pb-1 flex items-center gap-1.5">
                                      <UtensilsCrossed size={11} /> Cortes Premium
                                    </h5>
                                    {aiAdvice.meatSuggestions?.map((item, i) => (
                                      <div key={i} className="bg-muted/20 border border-border/10 p-3 rounded-xl">
                                        <div className="flex justify-between items-baseline gap-2">
                                          <span className="font-extrabold text-xs text-foreground">{item.cut}</span>
                                          <span className="text-[10px] font-black text-amber-500 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-md">{item.quantity}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{item.reason}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-500 border-b border-orange-500/10 pb-1 flex items-center gap-1.5">
                                      <ShoppingBag size={11} /> Guarnições
                                    </h5>
                                    {aiAdvice.sidesSuggestions?.map((item, i) => (
                                      <div key={i} className="bg-muted/20 border border-border/10 p-3 rounded-xl">
                                        <div className="flex justify-between items-baseline gap-2">
                                          <span className="font-extrabold text-xs text-foreground">{item.side}</span>
                                          <span className="text-[10px] font-black text-orange-500 shrink-0 bg-orange-500/10 px-2 py-0.5 rounded-md">{item.quantity}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{item.tip}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                                <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-500">
                                  <Sparkles size={22} className="fill-amber-500/10 animate-pulse" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-foreground">Mentoria do Chef Assador</h4>
                                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                                    Ative o Gemini AI para receber cortes nobres, técnicas de brasa e harmonizações exclusivas.
                                  </p>
                                </div>
                                <Button onClick={fetchAiAdvice} disabled={isGeneratingAi}
                                  className="py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2">
                                  <Sparkles size={13} className="fill-white/20" /> Ativar Chef IA
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* TAB: Fornecedores Próximos */}
                        {activeTab === 'suppliers' && (
                          <motion.div key="suppliers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-foreground">Fornecedores Sugeridos</h4>
                              {userLocation && (
                                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                  <Navigation size={11} /> Próximos de você
                                </span>
                              )}
                            </div>

                            {isLoadingSuppliers ? (
                              <div className="flex justify-center py-10">
                                <Loader2 size={28} className="animate-spin text-primary" />
                              </div>
                            ) : nearbySuppliers.length === 0 ? (
                              <div className="text-center py-10 space-y-4">
                                <div className="text-4xl">📍</div>
                                <p className="text-sm font-bold text-muted-foreground">Nenhum fornecedor carregado ainda.</p>
                                <Button onClick={handleFindSuppliers} className="rounded-xl px-5 py-3 text-xs font-black">
                                  <Navigation size={14} className="mr-2" /> Buscar Próximos
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                {nearbySuppliers.map(s => {
                                  const isPremium = s.user?.plan === 'SUPPLIER_PREMIUM';
                                  return (
                                    <div key={s.id} className={`flex items-start gap-4 p-4 rounded-2xl hover:shadow-md transition-all duration-300 group relative overflow-hidden border ${
                                      isPremium 
                                        ? 'bg-gradient-to-br from-amber-500/[0.04] via-card to-primary/[0.02] border-amber-500/25' 
                                        : 'bg-card border-border/50 hover:border-primary/20'
                                    }`}>
                                      {isPremium && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent px-2.5 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                                          <Sparkles size={8} className="fill-amber-500 text-amber-500" /> Parceiro Ouro
                                        </div>
                                      )}
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden shadow-sm ${
                                        isPremium ? 'bg-card border-amber-500/20' : 'bg-primary/5 border-primary/15 text-primary'
                                      }`}>
                                        {s.logo ? <img src={s.logo} className="w-full h-full object-cover" alt="Logo" /> : <ShoppingBag size={18} />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                                          {s.companyName}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-0.5">
                                          <MapPin size={10} /> {s.city} · {s.category}
                                        </p>
                                        <p className="text-[11px] text-foreground/75 mt-1.5 line-clamp-2 leading-relaxed font-medium">{s.description}</p>
                                      </div>
                                      <a href={`https://api.whatsapp.com/send?phone=${s.phone}`} target="_blank" rel="noreferrer"
                                        className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all duration-300 shrink-0 self-center">
                                        <Phone size={13} />
                                      </a>
                                    </div>
                                  );
                                })}
                                <button
                                  onClick={() => toast.info('Acesse "Serviços" na navegação para ver todos os fornecedores.')}
                                  className="w-full text-center text-xs font-black text-primary py-2.5 flex items-center justify-center gap-1 hover:opacity-70 transition-opacity"
                                >
                                  Ver todos os fornecedores <ChevronRight size={14} />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="border-dashed border-2 border-border/50 p-10 sm:p-14 text-center bg-card/30 rounded-3xl">
                    <div className="text-5xl mb-5">{selectedType.emoji}</div>
                    <h3 className="text-base font-extrabold text-foreground/90">{selectedType.label} — Pronto para calcular!</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">{selectedType.desc}</p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 border px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles size={10} className="text-secondary" /> Sem Desperdício
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 border px-3 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={10} className="text-primary" /> Estimativas Reais
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 border px-3 py-1 rounded-full flex items-center gap-1">
                        <MapPin size={10} className="text-emerald-500" /> Fornecedores Próximos
                      </span>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
