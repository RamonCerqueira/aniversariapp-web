import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super-secret-jwt-key-Celebrate-2026',
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  const { name, email, password, birthDate, role, supplierProfile } = req.body;

  try {
    if (!name || !email || !password || !birthDate) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const emailExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (emailExists) {
      return res.status(400).json({ error: 'E-mail já está cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        birthDate: new Date(birthDate),
        role: role || 'ORGANIZER',
        plan: role === 'SUPPLIER' ? 'SUPPLIER_MONTHLY' : 'FREE',
        ...(role === 'SUPPLIER' && {
          supplierProfile: {
            create: {
              companyName: supplierProfile?.companyName || name,
              cnpj: supplierProfile?.cnpj || null,
              category: supplierProfile?.category || 'Buffet',
              phone: supplierProfile?.phone || '',
              city: supplierProfile?.city || '',
              description: supplierProfile?.description || '',
              instagram: supplierProfile?.instagram || '',
              capacityMin: parseInt(supplierProfile?.capacityMin) || 0,
              capacityMax: parseInt(supplierProfile?.capacityMax) || 10000,
              images: supplierProfile?.images || ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=300']
            }
          }
        })
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        role: user.role,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Usuário não cadastrado, cadastre-se agora' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        role: user.role,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

export const subscribe = async (req, res) => {
  const { plan } = req.body;

  try {
    if (!plan || !['FREE', 'PREMIUM', 'MASTER'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { plan },
      select: { id: true, name: true, email: true, plan: true, birthDate: true }
    });

    res.json({
      message: `Plano atualizado para ${plan} com sucesso!`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ error: 'Erro ao atualizar assinatura' });
  }
};
