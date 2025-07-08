'use client'

import { useAuth } from './auth-context';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import { AuthDialog } from './login-modal';
import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarImage } from './ui/avatar';
import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu';
import { signOut } from '@/lib/supabase-auth';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Referência para o AuthDialog
  const authDialogRef = React.useRef<{ open: () => void }>(null);

  // Função para abrir o AuthDialog
  const handleCadastrarImovelClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      if (authDialogRef.current) authDialogRef.current.open();
    }
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition ease-in-out ${
      pathname === href ? 'text-purple-700' : 'text-gray-700 hover:text-purple-700'
    }`;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      // Ignora erro de logout
    }
    setUser(null);
    router.push('/');
    router.refresh();
  };

  function UserDropdown({ mobile }: { mobile?: boolean } = {}) {
    const avatarUrl = user?.avatar_url;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {avatarUrl ? (
            <Avatar className={mobile ? 'cursor-pointer w-full' : 'cursor-pointer'}>
              <AvatarImage src={avatarUrl} alt="Avatar" />
            </Avatar>
          ) : (
            <div
              className={`${mobile ? 'w-full' : ''} flex justify-center px-5 py-3 border-2 border-purple-700 text-purple-700 bg-white hover:bg-purple-50 text-sm font-semibold rounded-full transition items-center gap-2 outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer`}
              style={{ minWidth: 0 }}
              tabIndex={0}
              role="button"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <UserCircle className='text-purple-700'/>
              <span>Meu Perfil</span>
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border border-gray-100 bg-white p-2 mt-2 animate-fade-in">
          <DropdownMenuArrow className="fill-white" />
          <div className="px-4 py-3 border-b border-gray-100 mb-2 flex items-center gap-3">
            {avatarUrl ? (
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatarUrl} alt="Avatar" />
              </Avatar>
            ) : (
              <UserCircle className="w-10 h-10 text-purple-700" />
            )}
            <div>
              <div className="font-semibold text-gray-900 text-sm">{user?.first_name || 'Usuário'}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
          <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium cursor-pointer">
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 font-medium cursor-pointer">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function SearchBar() {
    const [q, setQ] = React.useState('');
    const [estado, setEstado] = React.useState('');
    const [cidade, setCidade] = React.useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (estado) params.append('status', estado);
      if (cidade) params.append('cidade', cidade);
      router.push(`/results?${params.toString()}`);
    };

    return (
      <section className="flex justify-center items-center py-5 bg-purple-700 px-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row bg-white w-full max-w-7xl px-4 py-4 lg:px-6 lg:py-3 rounded-2xl gap-4 items-center"
        >
          <input
            type="text"
            placeholder="O que deseja procurar?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full lg:w-[50%] border-none focus:outline-none text-sm px-3"
          />

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[50%]">
            <Select onValueChange={setEstado}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md focus:outline-none">
                <SelectValue placeholder="Estado do Imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="para alugar">Para Alugar</SelectItem>
                <SelectItem value="para comprar">Para Comprar</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setCidade}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md focus:outline-none">
                <SelectValue placeholder="Cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Luanda">Luanda</SelectItem>
                <SelectItem value="Huambo">Huambo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-orange-500 px-4 py-3 rounded-lg text-white font-semibold hover:bg-orange-600 transition"
          >
            Procurar
          </button>
        </form>
      </section>
    );
  }

  const navLinks: { id: string; label: string; href: string }[] = [
    { id: 'inicio', label: 'ÍNICIO', href: '/' },
    { id: 'alugar', label: 'PARA ALUGAR', href: '/alugar' },
    { id: 'comprar', label: 'PARA COMPRAR', href: '/comprar' },
    { id: 'noticias', label: 'NOTÍCIAS', href: '#' },
    { id: 'contacto', label: 'CONTACTO', href: '/contato' },
  ];

  return (
    <header>
      <div className="max-w-7xl mx-auto flex justify-between items-center py-2 px-4 md:px-8">
        <Link href="/">
          <img src="/kerhome_logo.png" alt="kerhome logo" className="w-32 md:w-80" />
        </Link>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-purple-700">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-10">
          <ul className="flex items-center gap-6">
            {navLinks.map(({ id, label, href }) => (
              <Link key={id} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/cadastrar-imovel">
              <button
                className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-sm font-semibold text-white rounded-full"
                onClick={handleCadastrarImovelClick}
              >
                Cadastrar Imóvel
              </button>
            </Link>
            {!user && <AuthDialog ref={authDialogRef} />}
            {user ? (
              <UserDropdown />
            ) : null}
          </div>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 transition-all">
          <ul className="flex flex-col space-y-2 mb-4">
            {navLinks.map(({ id, label, href }) => (
              <Link key={id} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/cadastrar-imovel">
              <button className="w-full px-5 py-3 bg-purple-700 hover:bg-purple-800 text-sm font-semibold text-white rounded-full">
                Cadastrar Imóvel
              </button>
            </Link>
            {user ? (
              <div className="w-full">
                <UserDropdown mobile />
              </div>
            ) : (
              <div className="w-full">
                <AuthDialog />
              </div>
            )}
          </div>
        </div>
      )}

      <SearchBar />
    </header>
  );
}
