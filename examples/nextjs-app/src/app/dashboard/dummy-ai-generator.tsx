'use client';

import { FormEvent, useState } from 'react';
import { IconSparkles, IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { CheckoutOptions } from '@freemius/checkout';
import Paywall, { PaywallState, PaywallRestriction } from '@/components/paywall';

export default function DummyAiGenerator(props: { checkoutOptions: Partial<CheckoutOptions> }) {
    const [errorState, setErrorState] = useState<PaywallState>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (event: FormEvent) => {
        try {
            event.preventDefault();

            setIsLoading(true);
            setErrorState(null);

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'generate' }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'no_active_license') {
                    setErrorState(PaywallRestriction.NO_ACTIVE_LICENSE);
                } else if (data.code === 'insufficient_credits') {
                    setErrorState(PaywallRestriction.INSUFFICIENT_CREDITS);
                }
            }
        } catch (e) {
            // Handle any unexpected errors
            console.error('Error generating AI asset:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Paywall state={errorState} updateState={setErrorState} checkoutOptions={props.checkoutOptions} />
            <form action="/api/ai" method="POST" className="mt-4" onSubmit={handleSubmit}>
                <Button disabled={isLoading} type="submit">
                    {isLoading ? <IconLoader2 className="animate-spin" /> : <IconSparkles />}
                    {isLoading ? 'Generating...' : 'Generate AI Asset'}
                </Button>
            </form>
        </>
    );
}
