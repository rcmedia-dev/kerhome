import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin", className)} />
  );
}
