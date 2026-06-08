import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Bell, Check, Trash2, MessageSquare, Users, CheckCircle, 
  Wallet, Briefcase, Info, X, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationCenter({ onNavigate, className = "" }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const isSupplier = user?.role === 'SUPPLIER';

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling suave a cada 20 segundos
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.notifications.markAsRead(notif.id);
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      }
      setIsOpen(false);

      // Roteamento baseado no tipo de notificação
      if (onNavigate) {
        switch (notif.type) {
          case 'chat':
            onNavigate(isSupplier ? 'supplier-portal' : 'messages');
            break;
          case 'guest':
            onNavigate('guests');
            break;
          case 'task':
            onNavigate('checklist');
            break;
          case 'finance':
            onNavigate('finance');
            break;
          case 'lead':
            onNavigate('supplier-portal');
            break;
          default:
            onNavigate('home');
        }
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setIsLoading(true);
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Todas as notificações foram marcadas como lidas.');
    } catch (err) {
      toast.error('Erro ao atualizar notificações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      setIsLoading(true);
      await api.notifications.clearAll();
      setNotifications([]);
      toast.success('Histórico de notificações limpo.');
    } catch (err) {
      toast.error('Erro ao limpar notificações.');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const baseClass = "w-4 h-4 shrink-0";
    switch (type) {
      case 'chat':
        return <MessageSquare className={`${baseClass} text-sky-500`} />;
      case 'guest':
        return <Users className={`${baseClass} text-emerald-500`} />;
      case 'task':
        return <CheckCircle className={`${baseClass} text-indigo-500`} />;
      case 'finance':
        return <Wallet className={`${baseClass} text-rose-500`} />;
      case 'lead':
        return <Briefcase className={`${baseClass} text-amber-500`} />;
      default:
        return <Info className={`${baseClass} text-primary`} />;
    }
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    if (diffDays === 1) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-card shadow-sm border border-border/60 relative flex items-center justify-center cursor-pointer hover:bg-muted/50 active:scale-95 transition-all text-foreground shrink-0"
        title="Notificações"
      >
        <Bell size={18} strokeWidth={1.5} className={unreadCount > 0 ? "animate-swing" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center px-1 shadow-sm border border-card">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-[-10px] sm:right-0 mt-3 w-[calc(100vw-32px)] sm:w-96 max-h-[500px] overflow-hidden bg-card/98 backdrop-blur-2xl border border-border/65 rounded-3xl shadow-2xl z-[999] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-foreground">Central de Notificações</h4>
                {unreadCount > 0 && (
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/30 max-h-[350px] no-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-primary/40 mb-3">
                    <Bell size={20} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-extrabold text-foreground">Tudo limpo por aqui!</p>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                    Notificações de RSVPs, mensagens e orçamentos aparecerão aqui em tempo real.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors text-left relative overflow-hidden ${
                      !notif.isRead 
                        ? 'bg-gradient-to-r from-primary/[0.04] via-card to-card hover:from-primary/[0.08] border-l-[3px] border-l-primary' 
                        : 'bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-card border border-border/50 flex items-center justify-center shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${!notif.isRead ? 'font-extrabold text-foreground' : 'font-semibold text-foreground/80'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[9px] text-muted-foreground shrink-0 font-bold flex items-center gap-1">
                          <Clock size={10} /> {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                        {notif.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border/50 flex items-center justify-between bg-muted/20 gap-2 shrink-0">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0 || isLoading}
                  className="flex-1 text-center py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground bg-transparent border-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={12} strokeWidth={2.5} /> Marcar lidas
                </button>
                <div className="w-[1px] h-4 bg-border/50" />
                <button
                  onClick={handleClearAll}
                  disabled={isLoading}
                  className="flex-1 text-center py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:hover:text-muted-foreground bg-transparent border-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} strokeWidth={2} /> Limpar tudo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
