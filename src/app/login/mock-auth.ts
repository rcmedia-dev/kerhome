// Mock users para login fake
export const mockUsers = [
  {
    id: 1,
    email: 'demo@kerhome.com',
    password: '123456',
    firstName: 'Demo',
    lastName: 'User',
  },
  {
    id: 2,
    email: 'admin@kerhome.com',
    password: 'admin',
    firstName: 'Admin',
    lastName: 'User',
  },
];

export async function mockLogin(email: string, password: string) {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Usuário ou senha inválidos');
  }
  return { user };
}

export async function mockSignup(firstName: string, lastName: string, email: string, password: string) {
  const exists = mockUsers.some(u => u.email === email);
  if (exists) {
    throw new Error('Email já cadastrado');
  }
  // Simula cadastro
  return { user: { id: Date.now(), email, firstName, lastName } };
}
