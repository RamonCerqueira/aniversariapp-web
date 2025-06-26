import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect, FormButton } from '../components/FormComponents';
import { useParty } from '../contexts/PartyContext';
import { ArrowLeft } from 'lucide-react';

const PartyDetailsScreen = ({ partyId, onBack }) => {
  const { createParty, updateParty, getParty } = useParty();

  const isEditing = !!partyId;
  const existingParty = isEditing ? getParty(partyId) : null;

  const [formData, setFormData] = useState({
    name: existingParty?.name || '',
    type: existingParty?.type || '',
    date: existingParty?.date ? formatDateForInput(existingParty.date) : '',
    location: existingParty?.location || '',
    description: existingParty?.description || '',
    guestCount: existingParty?.guestCount?.toString() || '',
    budget: existingParty?.budget?.toString() || '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  function parseDate(dateString) {
    return new Date(dateString);
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
        date: parseDate(formData.date),
        location: formData.location.trim(),
        description: formData.description.trim(),
        guestCount: parseInt(formData.guestCount) || 0,
        budget: parseFloat(formData.budget) || undefined,
      };

      if (isEditing && partyId) {
        await updateParty(partyId, partyData);
        alert('Festa atualizada com sucesso!');
      } else {
        await createParty(partyData);
        alert('Festa criada com sucesso!');
      }

      onBack();
    } catch (error) {
      alert('Falha ao salvar festa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary-custom pt-12 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 mr-4"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-white text-2xl font-bold">
              {isEditing ? 'Editar Festa' : 'Nova Festa'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 -mt-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormInput
                    label="Data da Festa"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    error={errors.date}
                    required
                  />

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

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <FormButton
                    type="submit"
                    loading={isLoading}
                    className="flex-1"
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

