import AppMain from '@/components/app-main';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import AiApp from './ai-app';
import { freemius } from '@/lib/freemius';
import { examples } from '@/lib/ai';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const options = await freemius.checkout.createOptions({ user: session?.user, isSandbox: true });

    return (
        <AppMain title="New Chat" isLoggedIn={!!session}>
            <AiApp examples={examples} checkoutOptions={options} />
        </AppMain>
    );
}
