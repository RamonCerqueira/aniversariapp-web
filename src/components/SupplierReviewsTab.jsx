import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle, Share2, ThumbsUp, Quote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

export default function SupplierReviewsTab({ profile }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchReviews();
    }
  }, [profile?.id]);

  const fetchReviews = async () => {
    try {
      const data = await api.suppliers.getReviews(profile.id);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReview = () => {
    // Gerar link de WhatsApp
    const profileLink = `https://Celebrate.com.br/fornecedor/${profile?.id || 'meuperfil'}`;
    const text = `Olá! Tudo bem? Esperamos que a sua festa tenha sido inesquecível! 🎉%0A%0ASeria muito importante para nós se você pudesse deixar uma avaliação rápida sobre o nosso serviço no Celebrate. Demora só 1 minutinho:%0A${profileLink}%0A%0AMuito obrigado pela confiança!`;

    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Link gerado! Escolha os contatos no WhatsApp.');
  };

  const copyToClipboard = () => {
    const profileLink = `https://Celebrate.com.br/fornecedor/${profile?.id || 'meuperfil'}`;
    navigator.clipboard.writeText(profileLink);
    toast.success('Link do perfil copiado para a área de transferência!');
  };

  // Cálculos de reputação reais
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const getStarDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      pct: totalReviews > 0 ? Math.round((dist[stars] / totalReviews) * 100) : 0
    }));
  };

  const starDist = getStarDistribution();

  if (isLoading) {
    return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">

      {/* Cabeçalho de Reputação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Placar Geral */}
        <Card className="border-border/50 shadow-lg bg-card rounded-3xl overflow-hidden relative col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none z-0" />
          <CardContent className="p-8 flex flex-col items-center justify-center h-full relative z-10 text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Sua Reputação</h3>
            <div className="text-6xl font-black text-foreground mb-2 tracking-tighter">{averageRating}</div>
            <div className="flex gap-1 text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill={i <= Math.round(averageRating) ? "currentColor" : "none"} />)}
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Baseado em {totalReviews} avaliações</p>
          </CardContent>
        </Card>

        {/* Barras de Distribuição */}
        <Card className="border-border/50 shadow-lg bg-card rounded-3xl col-span-1 lg:col-span-2">
          <CardContent className="p-8 h-full flex flex-col justify-center">
            <div className="space-y-3">
              {starDist.map(item => (
                <div key={item.stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16 text-sm font-bold text-muted-foreground shrink-0">
                    {item.stars} <Star size={12} className="text-amber-500" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                  <div className="w-10 text-right text-xs font-bold text-muted-foreground shrink-0">{item.pct}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ferramenta de Aquisição de Avaliações */}
      <Card className="border border-primary/20 bg-primary/5 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <MessageCircle className="text-primary" size={24} /> Transforme clientes em fãs
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
              Fornecedores com mais de 5 avaliações vendem até 4x mais na plataforma. Peça para seus clientes recentes deixarem um depoimento rápido!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Button onClick={copyToClipboard} variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2">
              <Share2 size={18} /> Copiar Link
            </Button>
            <Button onClick={handleRequestReview} className="h-12 px-6 rounded-xl font-bold gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-none shadow-lg shadow-[#25D366]/20">
              <MessageCircle size={18} /> Pedir via WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed de Avaliações */}
      <div>
        <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
          <ThumbsUp className="text-primary" size={24} /> Últimas Avaliações
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {reviews.length === 0 && (
            <div className="text-center py-12 bg-muted/20 border border-border/50 border-dashed rounded-3xl">
              <Star className="mx-auto text-muted-foreground/30 mb-4" size={48} />
              <p className="text-muted-foreground font-bold">Nenhuma avaliação ainda.</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Use o botão acima para pedir para seus clientes!</p>
            </div>
          )}

          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg uppercase">
                        {review.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-foreground">{review.clientName}</h4>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-0.5">
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          {review.partyType && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{review.partyType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(review.rating)].map((_, idx) => (
                        <Star key={idx} size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <div className="relative pl-6">
                    <Quote className="absolute left-0 top-0 text-muted-foreground/20" size={20} />
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                      "{review.content}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
