import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { deductCredits, getUserLicense, hasCredits } from '@/lib/user-license';
import { getAiResponse } from '@/lib/ai';

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json(
            {
                code: 'unauthenticated',
                message: 'You must be logged in to use this feature.',
            },
            { status: 401 }
        );
    }

    // We assume an active license is needed regardless of the credit balance.
    const userLicense = await getUserLicense(session.user.id);

    if (!userLicense) {
        return Response.json(
            {
                code: 'no_active_purchase',
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

    const data = await request.json();

    if (!data.message || typeof data.message !== 'string') {
        return Response.json(
            {
                code: 'invalid_input',
                message: 'Invalid input provided. Please provide a valid message.',
            },
            { status: 400 }
        );
    }

    return Response.json(
        {
            // Insert the actual AI asset generation logic here.
            message: getAiResponse(data.message),
        },
        {
            status: 200,
        }
    );
}
