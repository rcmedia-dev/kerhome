'use client';

import { CustomSignUpForm } from '@/components/signup-form';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <CustomSignUpForm
                onSwitchToSignIn={() => router.push('/login')}
            />
        </div>
    );
}
