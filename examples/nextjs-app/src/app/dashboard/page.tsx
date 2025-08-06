import AppMain from '@/components/app-main';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DummyAiGenerator from './dummy-ai-generator';
import { freemius } from '@/lib/freemius';
import { splitName } from '@/lib/utils';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    const { firstName, lastName } = splitName(session.user.name);

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
            <div className="mt-8">
                <p className="text-lg font-semibold">AI Asset Generator</p>
                <p className="text-sm text-muted-foreground">
                    This feature is available only to users with an active license and sufficient credits.
                </p>
                <DummyAiGenerator
                    checkoutOptions={await freemius.checkout.getParams({
                        user_email: session.user.email,
                        user_firstname: firstName,
                        user_lastname: lastName,
                        readonly_user: true,
                        sandbox: true,
                    })}
                />
            </div>
        </AppMain>
    );
}
