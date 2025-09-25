'use client';
 
import { ProgressProvider } from '@bprogress/next/app';
 
const LoaderProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider 
      height="4px"
      color="#6D28D9"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
 
export default LoaderProviders;