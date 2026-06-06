import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const formatUser = (userData) => {
  if (!userData) return userData;
  return {
    ...userData,
    name: userData.name ? userData.name.toUpperCase() : userData.name
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = localStorage.getItem('Celebrate_user');
      const token = localStorage.getItem('Celebrate_token');
      if (storedUser && token) {
        setUser(formatUser(JSON.parse(storedUser)));
      } else {
        localStorage.removeItem('Celebrate_user');
        localStorage.removeItem('Celebrate_token');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email, birthDate) => {
    try {
      const deterministicPassword = `p@ss_${new Date(birthDate).getTime()}`;
      const res = await api.auth.login(email, deterministicPassword);

      const formattedUser = formatUser(res.user);
      localStorage.setItem('Celebrate_token', res.token);
      localStorage.setItem('Celebrate_user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      return formattedUser;
    } catch (error) {
      console.error('Erro ao fazer login na API:', error);
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      const deterministicPassword = `p@ss_${new Date(userData.birthDate).getTime()}`;

      const res = await api.auth.register(
        userData.name,
        userData.email,
        deterministicPassword,
        userData.birthDate,
        userData.role,
        userData.supplierProfile
      );

      const formattedUser = formatUser(res.user);
      localStorage.setItem('Celebrate_token', res.token);
      localStorage.setItem('Celebrate_user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      return formattedUser;
    } catch (error) {
      console.error('Erro ao registrar na API:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('Celebrate_user');
      localStorage.removeItem('Celebrate_token');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const updateUser = async (userData) => {
    if (!user) return;

    try {
      const updatedUser = formatUser({ ...user, ...userData });
      localStorage.setItem('Celebrate_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const subscribeToPlan = async (plan) => {
    try {
      const res = await api.auth.subscribe(plan);
      const formattedUser = formatUser(res.user);
      localStorage.setItem('Celebrate_user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      return res;
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
      throw error;
    }
  };

  const createStripeSession = async (plan) => {
    try {
      const res = await api.stripe.createCheckoutSession(plan);
      return res;
    } catch (error) {
      console.error('Erro ao criar sessão do Stripe:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginUser,
    registerUser,
    logout,
    updateUser,
    subscribeToPlan,
    createStripeSession,
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
