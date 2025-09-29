'use client'

import { ReactNode } from "react";
import { useAuth } from "@/components/auth-context";

type CanSeeItProps = {
  children: ReactNode;
  role?: string;
};

export function CanSeeIt({ children, role = "agent" }: CanSeeItProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  const hasAccess = user.role === role;

  return hasAccess ? <>{children}</> : null;
}
