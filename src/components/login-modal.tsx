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
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/lib/store/ui-store';

const supabase = createClient();

interface AuthDialogProps {
  trigger?: React.ReactNode;
  defaultMode?: 'signIn' | 'signUp';
  onSuccess?: () => void;
}

export const AuthDialog = forwardRef(function AuthDialog(
  { trigger, defaultMode = 'signIn', onSuccess }: AuthDialogProps,
  ref
) {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = useUIStore();
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signUp');
  const { setUser, fetchUserProfile } = useUserStore();

  useImperativeHandle(ref, () => ({
    open: () => openAuthModal(),
    close: () => closeAuthModal(),
  }));

  const handleSuccess = async () => {
    closeAuthModal();
    onSuccess?.();
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
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
