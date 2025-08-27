import { SubscriptionCancellationRequest } from '@freemius/sdk';

export const CancellationReason: Record<string, NonNullable<SubscriptionCancellationRequest['reason_ids']>[number]> = {
    WANT_PAYMENT_CONTROL: '1',
    NOT_SURE_IF_NEEDED: '2',
    SELDOM_USED: '3',
    DIFFICULT_TO_SET_UP: '4',
    MISSING_FEATURES: '5',
    SLOW_AND_BUGGY: '6',
    EXPENSIVE: '7',
};

export type CancellationReasonItem = {
    id: NonNullable<SubscriptionCancellationRequest['reason_ids']>[number];
    label: string;
};

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Returns cancellation reasons based on whether the user has a trial
 *
 * @param hasTrial - Whether the user has a trial period
 *
 * @returns Shuffled array of cancellation reasons
 */
export function getCancellationReasons(hasTrial: boolean): CancellationReasonItem[] {
    const baseReasons: CancellationReasonItem[] = [
        { id: CancellationReason.NOT_SURE_IF_NEEDED, label: "I'm not sure I want to keep it." },
        { id: CancellationReason.DIFFICULT_TO_SET_UP, label: 'It was too difficult to set up.' },
        { id: CancellationReason.MISSING_FEATURES, label: "It didn't have the features I was looking for." },
        { id: CancellationReason.SLOW_AND_BUGGY, label: 'It was too slow and/or buggy.' },
        { id: CancellationReason.EXPENSIVE, label: 'The cost was too high.' },
    ];

    if (!hasTrial) {
        baseReasons.push(
            { id: CancellationReason.WANT_PAYMENT_CONTROL, label: 'I want to control when I pay.' },
            { id: CancellationReason.SELDOM_USED, label: 'I never/seldom use it.' }
        );
    }

    return shuffleArray(baseReasons);
}
