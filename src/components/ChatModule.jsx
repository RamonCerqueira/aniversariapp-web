import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Lock, User, Building, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatModule({ userRole }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const data = await api.chat.list();
      setRooms(data);
    } catch (error) {
      toast.error('Erro ao carregar conversas.');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId) => {
    setIsLoadingMessages(true);
    try {
      const data = await api.chat.getMessages(roomId);
      setMessages(data.messages);
      
      // Update the active room with latest details if needed
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isClosed: data.room.isClosed } : r));
      setActiveRoom(prev => ({ ...prev, isClosed: data.room.isClosed }));
    } catch (error) {
      toast.error('Erro ao carregar histórico de mensagens.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    setIsSending(true);
    try {
      const sentMessage = await api.chat.sendMessage(activeRoom.id, newMessage.trim());
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update room preview
      setRooms(prev => prev.map(r => {
        if (r.id === activeRoom.id) {
          return { ...r, messages: [sentMessage], updatedAt: new Date() };
        }
        return r;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      
    } catch (error) {
      toast.error(error.message || 'Falha ao enviar mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEndChat = async () => {
    if (!activeRoom) return;
    try {
      await api.chat.closeChat(activeRoom.id);
      setActiveRoom(prev => ({ ...prev, isClosed: true }));
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, isClosed: true } : r));
      toast.success('Chat encerrado com sucesso. O fornecedor não poderá mais enviar mensagens.');
    } catch (error) {
      toast.error('Erro ao encerrar chat.');
    }
  };

  if (isLoadingRooms) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-card rounded-3xl shadow-sm border border-border">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex overflow-hidden border-border/50 rounded-3xl shadow-lg bg-card">
      {/* Sidebar: Room List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-muted/10">
        <div className="p-4 border-b border-border/50 bg-card">
          <h2 className="font-black text-lg text-foreground">Mensagens</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
             <div className="p-6 text-center text-muted-foreground text-sm font-medium">
               Nenhuma conversa iniciada.
             </div>
          ) : (
            rooms.map(room => {
              const isSupplier = userRole === 'SUPPLIER';
              const contactName = isSupplier ? room.party?.name : room.supplier?.companyName;
              const contactIcon = isSupplier ? <User size={18} /> : <Building size={18} />;
              const lastMessage = room.messages?.[0]?.content || 'Nenhuma mensagem ainda.';
              
              return (
                <div 
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-4 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/50 ${activeRoom?.id === room.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-foreground truncate flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary/70 shrink-0">
                         {contactIcon}
                      </div>
                      <span className="truncate">{contactName}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium pl-10">
                    {room.isClosed && <Lock size={10} className="inline mr-1 text-rose-500" />}
                    {lastMessage}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background/50">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b border-border/50 bg-card flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary">
                  {userRole === 'SUPPLIER' ? <User size={20} /> : <Building size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-foreground">
                    {userRole === 'SUPPLIER' ? activeRoom.party?.name : activeRoom.supplier?.companyName}
                  </h3>
                  {activeRoom.isClosed ? (
                     <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500 flex items-center gap-1">
                       <Lock size={10} /> Chat Encerrado
                     </span>
                  ) : (
                     <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1">
                       <Clock size={10} /> Ativo
                     </span>
                  )}
                </div>
              </div>

              {userRole === 'ORGANIZER' && !activeRoom.isClosed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEndChat}
                  className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-rose-200 font-bold uppercase text-[10px] tracking-wider"
                >
                  <Lock size={12} className="mr-1.5" /> Encerrar Chat
                </Button>
              )}
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                  Envie a primeira mensagem para iniciar a negociação.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm shadow-sm ${
                          isMine 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-card border border-border/60 text-foreground rounded-tl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[9px] mt-1 block font-bold ${isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <div className="p-4 bg-card border-t border-border/50">
              {activeRoom.isClosed ? (
                <div className="p-3 text-center bg-rose-500/10 text-rose-600 rounded-xl text-xs font-bold border border-rose-500/20">
                  {userRole === 'ORGANIZER' 
                    ? 'Você encerrou esta conversa. O fornecedor não pode mais lhe contatar.' 
                    : 'O cliente encerrou esta conversa.'}
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 rounded-xl bg-muted/50 border-transparent focus:bg-background"
                    disabled={isSending}
                  />
                  <Button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()} 
                    className="rounded-xl px-4 bg-primary text-white shadow-md"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-primary/30 mb-4">
               <Send size={32} />
            </div>
            <p className="font-bold text-sm">Selecione uma conversa ao lado</p>
          </div>
        )}
      </div>
    </Card>
  );
}
