'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomSignInForm } from '@/components/login-form';
import { CustomSignUpForm } from '@/components/signup-form';
import { useUserStore } from '@/lib/store/user-store';
import { supabase } from '@/lib/supabase';

interface AuthDialogProps {
  trigger?: React.ReactNode;
  defaultMode?: 'signIn' | 'signUp';
  onSuccess?: () => void;
}

export const AuthDialog = forwardRef(function AuthDialog(
  { trigger, defaultMode = 'signIn', onSuccess }: AuthDialogProps,
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signUp');
  const { setUser, fetchUserProfile } = useUserStore();

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  const handleSuccess = async () => {
    try {
      // Buscar o perfil do usuário após login/signup bem-sucedido
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProfile = await fetchUserProfile(user.id);
        if (userProfile) {
          setUser(userProfile);
        }
      }
      
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Autenticação</DialogTitle>
        {isSignUp ? (
          <CustomSignUpForm
            onSuccess={handleSuccess}
            onSwitchToSignIn={() => setIsSignUp(false)}
          />
        ) : (
          <CustomSignInForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={() => setIsSignUp(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
});