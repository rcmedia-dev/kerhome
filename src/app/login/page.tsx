'use client';

import { CustomSignInForm } from '@/components/login-form';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <CustomSignInForm
                onSwitchToSignUp={() => router.push('/signup')}
            />
        </div>
    );
}
