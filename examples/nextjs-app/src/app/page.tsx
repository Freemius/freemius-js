import Image from 'next/image';
import Link from 'next/link';
import FSLogoFull from '@/components/fs-logo-full';
import { Button } from '@/components/ui/button';
import FSSymbol from '@/components/fs-symbol';
import { IconSignRight } from '@tabler/icons-react';

export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl">
                <div className="flex items-end gap-4">
                    <FSLogoFull className="h-12 w-auto" />
                    <span className="text-2xl font-bold translate-y-[3px]">Node.js SDK</span>
                </div>

                <div className="text-center sm:text-left">
                    <h1 className="text-4xl sm:text-6xl font-bold mb-6">
                        Complete SaaS Integration <br />
                        <span className="text-grow">Made Simple</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8">
                        Experience a full-featured demonstration of the Freemius Node.js SDK. See how to implement
                        checkout flows, webhook handling, subscription management, and credit-based billing in a modern
                        Next.js application.
                    </p>
                </div>

                <div className="flex gap-4 items-center flex-col sm:flex-row w-full sm:w-auto">
                    <Button variant="default" asChild>
                        <span>
                            <IconSignRight size={16} />
                            <Link href="/dashboard">Start Demonstration</Link>
                        </span>
                    </Button>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">What You'll Experience:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <span>
                                <strong>Secure Checkout:</strong> Freemius overlay integration with sandbox mode
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>
                                <strong>Real-time Webhooks:</strong> License events and subscription updates
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>
                                <strong>Credit Management:</strong> Credit subscription and top-ups
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>
                                <strong>API Integration:</strong> Call to the Freemius API for subscription & user
                                management
                            </span>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://freemius.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FSSymbol className="h-4 w-4" />
                    Freemius.com
                </a>
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://freemius.com/help/documentation/saas/saas-integration/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
                    Documentation
                </a>
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://github.com/Freemius/freemius-node"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
                    GitHub Repository
                </a>
            </footer>
        </div>
    );
}
