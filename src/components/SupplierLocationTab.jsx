import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2, Map, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function SupplierLocationTab({ form, setForm }) {
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const handleCepChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 5) {
      val = val.substring(0, 5) + '-' + val.substring(5, 8);
    }
    setForm({...form, locationMap: {...form.locationMap, zipCode: val}});
  };

  const handleCepSearch = async () => {
    const cep = form.locationMap.zipCode?.replace(/\D/g, '');
    if (cep?.length !== 8) {
      toast.warning('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setIsCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error('CEP não encontrado.');
      } else {
        // Obter coordenadas aproximadas via Nominatim (OpenStreetMap)
        let lat = null;
        let lng = null;
        try {
          const query = encodeURIComponent(`${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`);
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        } catch (e) {
          console.error("Erro ao buscar coordenadas geográficas:", e);
        }

        setForm(prev => ({
          ...prev,
          locationMap: {
            ...prev.locationMap,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            lat: lat,
            lng: lng
          }
        }));
        
        if (lat && lng) {
          toast.success('Endereço e mapa atualizados com sucesso!');
        } else {
          toast.warning('Endereço preenchido, mas precisão do mapa pode ser baixa. Clique em "Capturar meu GPS".');
        }
      }
    } catch (error) {
      toast.error('Erro ao buscar o CEP.');
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleGetLocation = () => {
    setIsGpsLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          locationMap: {
            ...prev.locationMap,
            lat: latitude,
            lng: longitude
          }
        }));
        toast.success('Localização capturada com sucesso! 📍');
        setIsGpsLoading(false);
      },
      (error) => {
        console.error('Erro no GPS:', error);
        toast.error('Não foi possível obter sua localização. Verifique as permissões.');
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Google Maps iFrame URL builder (Sem chave de API)
  const getMapUrl = () => {
    const loc = form.locationMap;
    if (loc.lat && loc.lng) {
      // Prioridade: Coordenadas Exatas
      return `https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=14&output=embed`;
    } else if (loc.city || loc.address) {
      // Secundário: Endereço ou Cidade
      const query = encodeURIComponent(`${loc.address || ''} ${loc.neighborhood || ''} ${loc.city || ''} ${loc.state || ''}`);
      return `https://maps.google.com/maps?q=${query}&z=14&output=embed`;
    }
    // Fallback genérico para a ferramenta ficar bonita
    return `https://maps.google.com/maps?q=Brasil&z=4&output=embed`;
  };

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="space-y-6">
          {/* Form de Endereço */}
          <Card className="border-border/50 shadow-xl bg-card rounded-3xl overflow-hidden">
            <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <MapPin className="text-primary" size={20} /> Base de Operações
                </h3>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Onde sua empresa fica</p>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-[180px] shrink-0 space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CEP</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={form.locationMap?.zipCode || ''} 
                      onChange={handleCepChange} 
                      placeholder="Ex: 01001-000" 
                      maxLength={9}
                      className="h-10 text-sm font-bold bg-muted/30" 
                    />
                    <Button variant="outline" onClick={handleCepSearch} disabled={isCepLoading} className="h-10 w-12 px-0 shrink-0 border-border/80 text-muted-foreground hover:text-foreground">
                      {isCepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="w-full flex-1 space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cidade / Estado</Label>
                  <Input 
                    value={form.locationMap?.city ? `${form.locationMap.city} - ${form.locationMap.state}` : ''} 
                    disabled 
                    placeholder="Buscando..." 
                    className="h-10 text-sm font-bold bg-muted/50 text-muted-foreground" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rua / Avenida</Label>
                <Input 
                  value={form.locationMap?.address || ''} 
                  onChange={e => setForm({...form, locationMap: {...form.locationMap, address: e.target.value}})} 
                  placeholder="Rua das Flores, 123" 
                  className="h-10 text-sm font-bold bg-muted/30" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bairro</Label>
                <Input 
                  value={form.locationMap?.neighborhood || ''} 
                  onChange={e => setForm({...form, locationMap: {...form.locationMap, neighborhood: e.target.value}})} 
                  placeholder="Centro" 
                  className="h-10 text-sm font-bold bg-muted/30" 
                />
              </div>

            </CardContent>
          </Card>

          {/* Área de Cobertura */}
          <Card className="border-border/50 shadow-xl bg-card rounded-3xl overflow-hidden flex flex-col">
            <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Navigation className="text-primary" size={20} /> Raio de Atendimento
                </h3>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Até onde você vai?</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Distância Máxima</Label>
                  <span className="text-2xl font-black text-primary">{form.locationMap?.radius || 50} <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">km</span></span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="200" 
                  step="5"
                  value={form.locationMap?.radius || 50}
                  onChange={e => setForm({...form, locationMap: {...form.locationMap, radius: e.target.value}})}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Bairro (5km)</span>
                  <span>Viagens Longas (200km)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Mapa Visual Interativo */}
        <Card className="border-border/50 shadow-xl bg-card rounded-3xl overflow-hidden h-[500px] lg:h-auto flex flex-col relative group">
          {/* Overlay de carregamento e blur se não tiver endereço */}
          {(!form.locationMap?.lat && !form.locationMap?.city) && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Map size={48} className="text-primary/40 mb-4" />
              <h4 className="text-lg font-black text-foreground">Mapa Interativo</h4>
              <p className="text-sm text-muted-foreground max-w-[250px] mt-2">
                Preencha o seu CEP ou capture o GPS para visualizar sua base no mapa.
              </p>
            </div>
          )}

          <div className="flex-1 w-full relative">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight="0" 
              marginWidth="0" 
              src={getMapUrl()}
              className="absolute inset-0 grayscale-[20%] contrast-125 rounded-t-3xl opacity-90 transition-opacity"
            >
            </iframe>
          </div>
          
          <div className="p-4 bg-card border-t border-border/50 z-20">
            <Button 
              onClick={handleGetLocation} 
              disabled={isGpsLoading}
              className={`w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${form.locationMap?.lat ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'}`}
            >
              {isGpsLoading ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
              {form.locationMap?.lat ? 'Coordenadas Capturadas (Atualizar GPS)' : 'Sincronizar com Meu GPS'}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground font-medium mt-3 px-4">
              O GPS garante a melhor precisão possível para colocar sua empresa no mapa dos clientes.
            </p>
          </div>
        </Card>

      </div>
    </motion.div>
  );
}
