import Link from 'next/link';
import SignIn from '@/components/sign-in';
import AppLogo from '@/components/app-logo';

export default function Login() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-5">
            <div className="min-w-sm md:min-w-md">
                <div className="flex justify-center mb-6">
                    <AppLogo />
                </div>
                <SignIn />
                <p className="mt-4 text-sm text-muted-foreground text-center">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="underline hover:text-primary">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
