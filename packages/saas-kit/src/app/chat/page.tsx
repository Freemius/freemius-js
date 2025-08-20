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

    const options = await freemius.checkout.createSessionOptions({ user: session?.user, isSandbox: true });
    // Or use the long-form builder:
    // const options = freemius.checkout.create()
    //   .withUser(session?.user)
    //   .inSandbox()
    //   .withPlan('1234')
    //   .withQuota(5000)
    //   .withCurrency('eur')
    //   .withCoupon({
    //     code: 'DISCOUNT2023',
    //     hideUI: false
    //   })
    //   .toOptions();

    return (
        <AppMain title="New Chat" isLoggedIn={!!session}>
            <DummyAiGenerator examples={examples} checkoutOptions={options} />
        </AppMain>
    );
}
