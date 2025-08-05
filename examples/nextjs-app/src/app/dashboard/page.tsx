import AppMain from '@/components/app-main';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    return (
        <AppMain title="Dashboard">
            <article className="prose">
                <h3>Welcome to Freemius Node.js SDK Demonstration</h3>
                <p>
                    This example demonstrates a complete SaaS application built with the Freemius Node.js SDK,
                    showcasing real-world integration patterns for subscription management, checkout flows, and webhook
                    handling.
                </p>
                <p>
                    Try the dummy AI asset generator below. The system will check your subscription status and guide you
                    through the checkout process if needed. Experience the complete flow from free trial to paid
                    subscription, including credit management and plan upgrades.
                </p>
            </article>
        </AppMain>
    );
}
