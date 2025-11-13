'use client'

import { ReactNode } from "react";
import { useUserStore } from "@/lib/store/user-store";

type CanSeeItProps = {
  children: ReactNode;
  role?: string;
};

export function CanSeeIt({ children, role = "agent" }: CanSeeItProps) {
  const { user, isLoading } = useUserStore();

  if (isLoading) return null;
  if (!user) return null;

  const hasAccess = user.role === role;

  return hasAccess ? <>{children}</> : null;
}
