import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, Camera } from 'lucide-react';

export const AnimatedHeader = ({ userName, onNotificationPress }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Manipula clique no ícone da câmera
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Lida com a seleção da imagem
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div className="bg-primary-custom pt-12 pb-6 px-6">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Animação do nome do usuário */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-white text-lg">Olá,</p>
          <h1 className="text-white text-2xl font-bold">{userName}</h1>
        </motion.div>

        {/* Ações do canto direito */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.3, damping: 15, stiffness: 150 }}
        >
          {/* Botão de notificação */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationPress}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full"
          >
            <Bell size={24} className="text-white" />
          </Button>

          {/* Botão de câmera / imagem */}
          <div className="relative w-12 h-12">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              onClick={handleCameraClick}
              className="w-full h-full rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center overflow-hidden"
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Foto selecionada"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
