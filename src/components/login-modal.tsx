'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomSignInForm } from './login-form';
import { CustomSignUpForm } from './signup-form';

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

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
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
