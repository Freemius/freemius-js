import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { PrismaClient } from '@generated/prisma';
import { addCredits } from './user-entitlement';

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql', // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        // NOTE: This is just for local development and shouldn't be used in production.
        requireEmailVerification: false,
        autoSignIn: true,
    },
    emailVerification: {
        sendOnSignIn: false,
        sendOnSignUp: false,
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            // Check if this is a sign-up endpoint
            if (ctx.path.startsWith('/sign-up')) {
                const newSession = ctx.context.newSession;
                if (newSession) {
                    // Add 150 credits on sign-up
                    await addCredits(newSession.user.id, 150);
                }
            }
        }),
    },
    plugins: [nextCookies()],
});
