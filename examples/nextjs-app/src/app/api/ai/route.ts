import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { deductCredits, getLicense, hasCredits } from '@/lib/user-license';

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    // We assume an active license is needed regardless of the credit balance.
    const userLicense = await getLicense(session.user.id);

    if (!userLicense) {
        return Response.json(
            {
                code: 'no_active_license',
                message: 'You do not have an active license to use this feature.',
            },
            { status: 403 }
        );
    }

    if (!(await hasCredits(userLicense.userId, 100))) {
        return Response.json(
            {
                code: 'insufficient_credits',
                message: 'You do not have enough credits to use this feature.',
            },
            { status: 403 }
        );
    }

    /**
     * Here you would implement the AI asset generation and credit consumption logic.
     * For demonstration, we will just return a dummy response and deduct 100 credits.
     */
    await deductCredits(userLicense.userId, 100);

    return Response.json(
        {
            message: 'AI asset generated successfully!',
        },
        {
            status: 200,
        }
    );
}
