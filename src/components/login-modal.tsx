'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomSignInForm } from './login-form';
import { CustomSignUpForm } from './signup-form';

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer border border-purple-700 text-purple-700 px-4 py-2 rounded-full">
          Minha Conta
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Login</DialogTitle>
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
}
