import Link from 'next/link';
import SignUp from '@/components/sign-up';
import AppLogo from '@/components/app-logo';

export default function Register() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-5">
            <div className="min-w-sm md:min-w-md">
                <div className="flex justify-center mb-6">
                    <AppLogo />
                </div>
                <SignUp />
                <p className="mt-4 text-sm text-muted-foreground text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="underline hover:text-primary">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
