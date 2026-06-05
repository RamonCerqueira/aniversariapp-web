import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = localStorage.getItem('aniversariapp_user');
      const token = localStorage.getItem('aniversariapp_token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem('aniversariapp_user');
        localStorage.removeItem('aniversariapp_token');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      // Cria uma senha determinística baseada na data de nascimento para manter o formulário transparente
      const deterministicPassword = `p@ss_${new Date(userData.birthDate).getTime()}`;
      
      let res;
      try {
        // Tenta registrar o usuário primeiro
        res = await api.auth.register(
          userData.name,
          userData.email,
          deterministicPassword,
          userData.birthDate,
          userData.role,
          userData.supplierProfile
        );
      } catch (err) {
        // Se o e-mail já existir, tenta fazer o login
        if (err.message.includes('já está cadastrado') || err.message.includes('Email already exists') || err.message.includes('Erro ao cadastrar')) {
          res = await api.auth.login(userData.email, deterministicPassword);
        } else {
          throw err;
        }
      }

      localStorage.setItem('aniversariapp_token', res.token);
      localStorage.setItem('aniversariapp_user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (error) {
      console.error('Erro ao fazer login/registro na API:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('aniversariapp_user');
      localStorage.removeItem('aniversariapp_token');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const updateUser = async (userData) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('aniversariapp_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const subscribeToPlan = async (plan) => {
    try {
      const res = await api.auth.subscribe(plan);
      localStorage.setItem('aniversariapp_user', JSON.stringify(res.user));
      setUser(res.user);
      return res;
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    subscribeToPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
