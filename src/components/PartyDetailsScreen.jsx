import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect, FormButton } from '../components/FormComponents';
import { useParty } from '../contexts/PartyContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const PartyDetailsScreen = ({ partyId, onBack }) => {
  const { createParty, updateParty, getParty } = useParty();

  const isEditing = !!partyId;
  const existingParty = isEditing ? getParty(partyId) : null;

  const [formData, setFormData] = useState({
    name: existingParty?.name || '',
    type: existingParty?.type || '',
    date: existingParty?.date ? formatDateForInput(existingParty.date) : '',
    time: existingParty?.date ? formatTimeForInput(existingParty.date) : '19:00',
    location: existingParty?.location || '',
    description: existingParty?.description || '',
    guestCount: existingParty?.guestCount?.toString() || '',
    budget: existingParty?.budget?.toString() || '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTimeForInput(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function parseDate(dateString, timeString) {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = (timeString || '19:00').split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  const partyTypeOptions = [
    { label: 'Churrasco', value: 'churrasco' },
    { label: 'Festa Infantil', value: 'festa_infantil' },
    { label: 'Festa de Adulto', value: 'festa_adulto' },
    { label: 'Festa Temática', value: 'festa_tematica' },
    { label: 'Confraternização', value: 'confraternizacao' },
    { label: 'Outro', value: 'outro' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da festa é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo da festa é obrigatório';
    }

    if (!formData.date.trim()) {
      newErrors.date = 'Data da festa é obrigatória';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Local da festa é obrigatório';
    }

    if (formData.guestCount && isNaN(parseInt(formData.guestCount))) {
      newErrors.guestCount = 'Número de convidados deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const partyData = {
        name: formData.name.trim(),
        type: formData.type,
        date: parseDate(formData.date, formData.time),
        location: formData.location.trim(),
        description: formData.description.trim(),
        guestCount: parseInt(formData.guestCount) || 0,
        budget: parseFloat(formData.budget) || undefined,
      };

      if (isEditing && partyId) {
        await updateParty(partyId, partyData);
        toast.success('Festa atualizada com sucesso! 🎉', {
          position: 'top-center',
          className: 'rounded-xl font-bold'
        });
      } else {
        await createParty(partyData);
        toast.success('Festa criada com sucesso! 🎂', {
          position: 'top-center',
          className: 'rounded-xl font-bold'
        });
      }

      onBack();
    } catch (error) {
      toast.error('Falha ao salvar festa. Tente novamente.', {
        position: 'top-center',
        className: 'rounded-xl font-bold animate-shake'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 relative overflow-hidden transition-colors duration-300">
      {/* Luzes aurorais de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/20 dark:bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-primary pt-12 pb-10 px-6 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 mr-4 rounded-full"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">
              {isEditing ? 'Editar Festa' : 'Nova Festa'}
            </h1>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="px-6 -mt-6 max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="shadow-2xl rounded-3xl border border-border/50 bg-card/75 backdrop-blur-lg">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <FormInput
                    label="Nome da Festa"
                    type="text"
                    placeholder="Ex: Aniversário de 30 anos"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={errors.name}
                    required
                  />

                  <FormSelect
                    label="Tipo de Festa"
                    placeholder="Selecione o tipo"
                    options={partyTypeOptions}
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    error={errors.type}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Data da Festa"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      error={errors.date}
                      required
                    />
                    <FormInput
                      label="Horário da Festa"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>

                  <FormInput
                    label="Local da Festa"
                    type="text"
                    placeholder="Ex: Chácara da família, Salão de festas"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    error={errors.location}
                    required
                  />

                  <FormInput
                    label="Número de Convidados"
                    type="number"
                    placeholder="Ex: 50"
                    value={formData.guestCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                    error={errors.guestCount}
                  />

                  <FormInput
                    label="Orçamento (R$)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2000.00"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>

                <FormTextarea
                  label="Descrição"
                  placeholder="Descreva sua festa (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 py-6 rounded-xl font-bold shadow-sm"
                  >
                    Cancelar
                  </Button>
                  <FormButton
                    type="submit"
                    loading={isLoading}
                    className="flex-1 py-6 rounded-xl font-bold shadow-md shadow-primary/10"
                  >
                    {isEditing ? 'Atualizar Festa' : 'Criar Festa'}
                  </FormButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PartyDetailsScreen;

