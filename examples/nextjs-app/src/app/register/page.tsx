import Link from 'next/link';
import FSLogoFull from '@/components/fs-logo-full';
import SignUp from '@/components/sign-up';

export default function Register() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-5">
            <div className="min-w-sm md:min-w-md">
                <div className="flex justify-center mb-6">
                    <FSLogoFull />
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
