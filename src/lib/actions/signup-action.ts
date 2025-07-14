'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const primeiro_nome = formData.get('firstName') as string;
  const ultimo_nome = formData.get('lastName') as string;

  if (!email || !password) {
    return { success: false, error: 'Email e senha são obrigatórios.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'Email já está cadastrado.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Criação do usuário com pacote "Básico"
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      primeiro_nome,
      ultimo_nome
    },
  });

  // Criar plano do agente associado ao usuário
  await prisma.planoAgente.create({
    data: {
      nome: 'Plano Básico',
      limite: 10,
      restante: 10, // por padrão no início
      destaques: true, // tem direito a 1 destaque
      userId: newUser.id,
    },
  });

  const userToClient = {
    id: newUser.id,
    email: newUser.email,
    primeiro_nome: newUser.primeiro_nome,
    ultimo_nome: newUser.ultimo_nome,
    username: newUser.username,
    telefone: newUser.telefone,
    empresa: newUser.empresa,
    licenca: newUser.licenca,
    website: newUser.website,
    facebook: newUser.facebook,
    linkedin: newUser.linkedin,
    instagram: newUser.instagram,
    youtube: newUser.youtube,
    sobre_mim: newUser.sobre_mim
  };

  return {
    success: true,
    user: userToClient,
  };
}
