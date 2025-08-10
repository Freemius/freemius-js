'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SignIn({ onSuccess }: { onSuccess?: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            value={email}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="password"
                            autoComplete="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            onClick={() => {
                                setRememberMe(!rememberMe);
                            }}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        onClick={async () => {
                            await signIn.email(
                                {
                                    email,
                                    password,
                                },
                                {
                                    onRequest: () => {
                                        setLoading(true);
                                    },
                                    onResponse: () => {
                                        setLoading(false);
                                    },
                                    onError: (ctx) => {
                                        toast.error(`Login failed: ${ctx.error.message}`);
                                    },
                                    onSuccess: () => {
                                        onSuccess?.();
                                        toast.success('Login successful!');
                                        router.push('/chat');
                                    },
                                }
                            );
                        }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <p> Login </p>}
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex justify-center w-full border-t py-4">
                    <p className="text-center text-xs text-neutral-500">
                        built with{' '}
                        <Link href="https://better-auth.com" className="underline" target="_blank">
                            <span className="dark:text-white/70 cursor-pointer">better-auth.</span>
                        </Link>
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
}
