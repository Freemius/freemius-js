'use client';

import * as React from 'react';
import {
    type PortalData,
    type ApplyRenewalCouponRequest,
    idToString,
    SubscriptionCancellationRequest,
} from '@freemius/sdk';
import { useLocale } from '../utils/locale';
import { formatCurrency, getDaysLeft } from '../utils/formatter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getRenewalCouponDiscounts } from '../utils/pricing-ops';
import { getCancellationReasons } from '../utils/cancellation';
import { usePortalAction } from '../hooks/data';
import Spinner from '../icons/spinner';

export function CancelSubscription(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    onClose: () => void;
    cancellationCoupons?: PortalData['cancellationCoupons'];
    afterCancel?: () => void;
    afterCouponApplied?: () => void;
}) {
    const { onClose, subscription, cancellationCoupons, afterCancel, afterCouponApplied } = props;
    const [cancellationState, setCancellationState] = React.useState<'confirm' | 'coupon' | 'reason'>('confirm');

    return (
        <div className="max-w-[65ch] my-5 bg-accent p-8 rounded-lg">
            {(function () {
                switch (cancellationState) {
                    case 'confirm':
                        return (
                            <ConfirmSubscriptionCancellation
                                subscription={subscription}
                                onClose={onClose}
                                onCancel={() => {
                                    if (cancellationCoupons?.length && subscription.applyRenewalCancellationCouponUrl) {
                                        setCancellationState('coupon');
                                    } else {
                                        setCancellationState('reason');
                                    }
                                }}
                            />
                        );
                    case 'coupon':
                        return (
                            <ApplyCancellationCoupon
                                subscription={subscription}
                                onClose={onClose}
                                onCancel={() => setCancellationState('reason')}
                                coupons={props.cancellationCoupons!}
                                afterCouponApplied={afterCouponApplied}
                            />
                        );
                    case 'reason':
                        return (
                            <AskReasonAndCancel
                                subscription={subscription}
                                onClose={onClose}
                                afterCancel={afterCancel}
                            />
                        );
                    default:
                        return null;
                }
            })()}
        </div>
    );
}

function ConfirmSubscriptionCancellation(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    onClose: () => void;
    onCancel: () => void;
}) {
    const { onClose, subscription, onCancel } = props;
    const locale = useLocale();

    const daysLeft =
        subscription.isTrial && subscription.trialEnds
            ? getDaysLeft(subscription.trialEnds)
            : getDaysLeft(subscription.renewalDate);

    return (
        <>
            <h2 className="text-lg font-semibold">{locale.portal.cancelSubscription.title.confirm()}</h2>

            <div className="leading-relaxed mt-6">
                {(subscription.isTrial
                    ? locale.portal.cancelSubscription.message.trial.paragraphs(daysLeft, null)
                    : locale.portal.cancelSubscription.message.regular.paragraphs(daysLeft)
                ).map((p, i) => (
                    <p className="mb-4" key={i}>
                        {p}
                    </p>
                ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={onCancel}>
                    {locale.portal.cancelSubscription.action.cancel()}
                </Button>

                <Button variant="default" onClick={onClose}>
                    {locale.portal.cancelSubscription.action.remindMe()}
                </Button>
            </div>
        </>
    );
}

function ApplyCancellationCoupon(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    onClose: () => void;
    onCancel: () => void;
    coupons: PortalData['cancellationCoupons'];
    afterCouponApplied?: () => void;
}) {
    const { onClose, subscription, onCancel, coupons } = props;
    const locale = useLocale();
    const couponsAvailable = coupons && coupons.length > 0;
    const { execute, loading } = usePortalAction<ApplyRenewalCouponRequest>(
        subscription.applyRenewalCancellationCouponUrl!
    );

    // protect against no coupons
    if (!couponsAvailable) {
        throw new Error('No coupons available');
    }

    const coupon = coupons[0];
    const { dollarOff, percentageOff } = getRenewalCouponDiscounts(
        coupon,
        subscription.renewalAmount,
        subscription.currency,
        subscription.paymentMethod === 'paypal'
    );

    const isPercentage = percentageOff > dollarOff;
    const discountLabel = isPercentage
        ? `${percentageOff}%`
        : formatCurrency(dollarOff, subscription.currency, locale.code);

    return (
        <>
            <div className="flex flex-col gap-4 justify-center items-center text-center">
                <div className="bg-primary text-primary-foreground rounded-xl p-10 gap-1 flex flex-col items-center justify-center w-50 h-50 shrink-0 grow-0">
                    <div className="text-6xl font-bold">{discountLabel}</div>
                    <div className="text-4xl font-semibold">
                        {locale.portal.cancelSubscription.message.coupon.off()}
                    </div>
                </div>

                <h2 className="text-2xl font-semibold mt-4 mb-3">
                    {locale.portal.cancelSubscription.title.coupon(discountLabel)}
                </h2>

                <div className="leading-relaxed">
                    {locale.portal.cancelSubscription.message.coupon
                        .paragraphs(coupon.has_renewals_discount ?? false, discountLabel)
                        .map((p, i) => (
                            <p className="mb-2" key={i}>
                                {p}
                            </p>
                        ))}
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    {locale.portal.cancelSubscription.action.couponCancel()}
                </Button>

                <Button
                    disabled={loading}
                    onClick={() => {
                        execute({ couponId: idToString(coupon.coupon_id!) }).then(() => {
                            if (typeof window !== 'undefined') {
                                window.alert(locale.portal.cancelSubscription.alert.couponApplied());
                            }

                            props.afterCouponApplied?.();
                        });
                    }}
                >
                    {loading ? <Spinner className="size-4" /> : null}
                    Get discount
                </Button>

                <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                    {locale.portal.cancelSubscription.action.back()}
                </Button>
            </div>
        </>
    );
}

function AskReasonAndCancel(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    onClose: () => void;
    afterCancel?: () => void;
}) {
    const { onClose, subscription, afterCancel } = props;
    const locale = useLocale();
    const [reasons, setReasons] = React.useState<NonNullable<SubscriptionCancellationRequest['reason_ids']>>([]);
    const [feedback, setFeedback] = React.useState<string>('');
    const { execute, loading } = usePortalAction<SubscriptionCancellationRequest>(subscription.cancelRenewalUrl);

    const hasTrial = subscription.isTrial;
    const reasonOptions = React.useMemo(() => getCancellationReasons(hasTrial), [hasTrial]);

    return (
        <>
            <h2 className="text-lg font-semibold">{locale.portal.cancelSubscription.title.reason()}</h2>

            <div className="leading-relaxed mt-6">
                {locale.portal.cancelSubscription.message.reason.paragraphs().map((p, i) => (
                    <p className="mb-2" key={i}>
                        {p}
                    </p>
                ))}
            </div>

            <div className="flex flex-col mt-6 gap-6">
                <div>
                    <Label className="mb-3">{locale.portal.cancelSubscription.message.reason.form.reason()}</Label>
                    <div className="space-y-3">
                        {reasonOptions.map((r) => (
                            <div key={r.id} className="flex items-center gap-3">
                                <Checkbox
                                    id={`reason-${r.id}`}
                                    checked={reasons.includes(r.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setReasons((prev) => [...prev, r.id]);
                                        } else {
                                            setReasons((prev) => prev.filter((id) => id !== r.id));
                                        }
                                    }}
                                />
                                <label htmlFor={`reason-${r.id}`} className="text-sm cursor-pointer">
                                    {r.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="sub-cancel-reason" className="mb-3">
                        {locale.portal.cancelSubscription.message.reason.form.feedback()}
                    </Label>
                    <Textarea
                        placeholder={locale.portal.cancelSubscription.message.reason.form.feedbackPlaceholder()}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        id="sub-cancel-reason"
                        className="min-h-25"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    {locale.portal.cancelSubscription.action.back()}
                </Button>

                <Button
                    variant="destructive"
                    disabled={loading}
                    onClick={() => {
                        execute({ feedback, reason_ids: reasons.length ? reasons : undefined }).then(() => {
                            if (typeof window !== 'undefined') {
                                window.alert(locale.portal.cancelSubscription.alert.subscriptionCancelled());
                            }

                            afterCancel?.();
                        });
                    }}
                >
                    {loading ? <Spinner className="size-4" /> : null}
                    {locale.portal.cancelSubscription.action.confirmCancel(hasTrial)}
                </Button>
            </div>
        </>
    );
}
