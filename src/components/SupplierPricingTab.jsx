import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, Trash2, Package, Sparkles, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SupplierPricingTab({ form, setForm }) {

  const handlePricingChange = (field, value) => {
    // Apenas números
    const numericValue = value.replace(/\D/g, '');
    setForm({
      ...form,
      pricing: { ...form.pricing, [field]: numericValue }
    });
  };

  const handleAddPackage = () => {
    const newPackage = {
      id: Date.now().toString(),
      name: '',
      price: '',
      description: '',
      type: 'Bronze' // Tipos: Bronze, Prata, Ouro, Diamante, Personalizado
    };
    setForm({
      ...form,
      packages: [...(form.packages || []), newPackage]
    });
  };

  const handleUpdatePackage = (id, field, value) => {
    setForm({
      ...form,
      packages: form.packages.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  const handleRemovePackage = (id) => {
    setForm({
      ...form,
      packages: form.packages.filter(p => p.id !== id)
    });
  };

  const formatCurrency = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);
  };

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-8 pb-10">
      
      {/* 1. Faixa Geral de Preços */}
      <Card className="border-border/50 shadow-lg bg-card rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none z-0" />
        <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <DollarSign className="text-primary" size={20} /> Faixa de Preço Geral
            </h3>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
              Deixe em branco para exibir "Sob Consulta"
            </p>
          </div>
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Preço Mínimo <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full">A partir de</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <Input 
                  value={form.pricing?.min ? (form.pricing.min / 100).toFixed(2).replace('.', ',') : ''}
                  onChange={(e) => handlePricingChange('min', e.target.value)}
                  placeholder="0,00"
                  className="pl-10 h-12 text-lg font-black tracking-tight"
                />
              </div>
            </div>
            
            <div className="hidden sm:flex items-center justify-center mt-6">
              <div className="w-4 h-0.5 bg-border rounded-full" />
            </div>

            <div className="w-full sm:w-1/2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preço Máximo (Opcional)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <Input 
                  value={form.pricing?.max ? (form.pricing.max / 100).toFixed(2).replace('.', ',') : ''}
                  onChange={(e) => handlePricingChange('max', e.target.value)}
                  placeholder="0,00"
                  className="pl-10 h-12 text-lg font-black tracking-tight"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Gerenciador de Pacotes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <Package className="text-primary" size={24} /> Meus Pacotes Prontos
            </h3>
            <p className="text-sm text-muted-foreground">Ofereça combos estruturados para facilitar a decisão do cliente.</p>
          </div>
          <Button onClick={handleAddPackage} className="h-10 px-4 rounded-xl font-bold gap-2">
            <Plus size={16} /> Novo Pacote
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <AnimatePresence>
            {(!form.packages || form.packages.length === 0) && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="col-span-1 lg:col-span-2">
                <Card className="border-2 border-dashed border-border/50 bg-card/30 rounded-3xl">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Sparkles size={48} className="text-primary/20 mb-4" />
                    <h4 className="text-lg font-bold text-foreground">Nenhum pacote cadastrado</h4>
                    <p className="text-sm text-muted-foreground max-w-md mt-2">
                      Você sabia que fornecedores com pacotes bem definidos recebem 3x mais fechamentos rápidos? Crie seu primeiro pacote!
                    </p>
                    <Button onClick={handleAddPackage} variant="outline" className="mt-6 rounded-xl font-bold">
                      Criar Pacote Agora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {form.packages?.map((pkg, index) => (
              <motion.div 
                key={pkg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-border/50 shadow-md bg-card rounded-3xl overflow-hidden group hover:shadow-xl hover:border-primary/30 transition-all">
                  <div className="bg-muted/30 p-4 border-b border-border/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                        {index + 1}
                      </div>
                      <Select value={pkg.type} onValueChange={(value) => handleUpdatePackage(pkg.id, 'type', value)}>
                        <SelectTrigger className="bg-transparent border-none font-black text-foreground text-sm uppercase tracking-wider outline-none cursor-pointer h-auto py-1 shadow-none focus:ring-0 px-2 w-auto min-w-[120px]">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Básico">BÁSICO</SelectItem>
                          <SelectItem value="Bronze">BRONZE</SelectItem>
                          <SelectItem value="Prata">PRATA</SelectItem>
                          <SelectItem value="Ouro">OURO</SelectItem>
                          <SelectItem value="Diamante">DIAMANTE</SelectItem>
                          <SelectItem value="Personalizado">PERSONALIZADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemovePackage(pkg.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome do Pacote</Label>
                      <Input 
                        value={pkg.name}
                        onChange={(e) => handleUpdatePackage(pkg.id, 'name', e.target.value)}
                        placeholder="Ex: Kit Festa Escolar Completa"
                        className="h-10 text-sm font-bold bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor (Opcional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">R$</span>
                        <Input 
                          value={pkg.price ? (pkg.price / 100).toFixed(2).replace('.', ',') : ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            handleUpdatePackage(pkg.id, 'price', val);
                          }}
                          placeholder="0,00"
                          className="h-10 pl-8 text-sm font-bold bg-background"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                        <span>O que está incluso?</span>
                        <span className="text-primary font-medium lowercase normal-case">Um item por linha</span>
                      </Label>
                      <textarea 
                        value={pkg.description}
                        onChange={(e) => handleUpdatePackage(pkg.id, 'description', e.target.value)}
                        placeholder="Ex:&#10;Bolo de 2 andares&#10;100 Salgados variados&#10;4 horas de serviço"
                        className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none h-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </motion.div>
  );
}
