import AppMain from '@/components/app-main';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import DummyAiGenerator from './dummy-ai-generator';
import { freemius } from '@/lib/freemius';
import { examples } from '@/lib/ai';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const options = await freemius.checkout.createOptions({ user: session?.user, isSandbox: true });
    const paywallData = await freemius.checkout.retrievePaywallData();

    return (
        <AppMain title="New Chat" isLoggedIn={!!session}>
            <DummyAiGenerator examples={examples} checkoutOptions={options} paywallData={paywallData} />
        </AppMain>
    );
}
