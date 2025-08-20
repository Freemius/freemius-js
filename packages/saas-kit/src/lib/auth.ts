import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@generated/prisma';

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
    plugins: [nextCookies()],
});
