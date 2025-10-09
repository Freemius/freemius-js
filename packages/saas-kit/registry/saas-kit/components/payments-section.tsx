import * as React from 'react';
import { PortalPayment, SellingUnit } from '@freemius/sdk';
import { useLocale } from '../utils/locale';
import { SectionHeading } from './section-heading';
import PaymentIcon from './payment-icon';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatter';
import { Button } from '@/components/ui/button';
import PdfIcon from '../icons/pdf';
import { PaymentBadge } from './payment-badge';
import PaginatedList from './paginated-list';

export function PaymentsSection(props: { payments: PortalPayment[]; unit: SellingUnit }) {
    const { payments } = props;
    const locale = useLocale();

    return (
        <div className="fs-saas-starter-payments-section">
            <SectionHeading>{locale.portal.payments.title()}</SectionHeading>
            <PaginatedList
                items={payments}
                getKey={(payment) => payment.id!}
                renderContainer={(children) => (
                    <div className="fs-saas-starter-payments-section__details grid lg:grid-cols-[150px_100px_auto_auto_auto] gap-x-10 gap-y-8 items-center">
                        {children}
                    </div>
                )}
            >
                {(payment) => (
                    <div
                        key={payment.id}
                        className="fs-saas-starter-payments-section__payment grid items-center col-span-full grid-cols-[auto_auto_auto] grid-rows-2 gap-2 lg:grid-cols-subgrid lg:grid-rows-1 lg:gap-6"
                    >
                        <div className="fs-saas-starter-payments-section__date flex gap-1 items-center">
                            <PaymentIcon method={payment.paymentMethod} />
                            <span className="fs-saas-starter-payments-section__date-value ml-2">
                                {formatDate(payment.createdAt, locale.code, false)}
                            </span>
                        </div>

                        <div className="fs-saas-starter-payments-section__amount tabular-nums text-right">
                            {formatCurrency(payment.gross!, payment.currency!, locale.code)}
                        </div>

                        <div className="fs-saas-starter-payments-section__badge ml-auto lg:ml-0">
                            <PaymentBadge
                                type={payment.type}
                                occurance={
                                    payment.subscription_id ? (payment.is_renewal ? 'renewal' : 'first') : 'oneoff'
                                }
                            />
                        </div>

                        <div className="fs-saas-starter-payments-section__plan col-span-2 lg:col-span-1">
                            {payment.planTitle}{' '}
                            {payment.quota && payment.quota > 1 ? (
                                <span className="text-disabled-foreground text-xs font-semibold">
                                    {locale.portal.payments.pricingTitle(
                                        formatNumber(payment.quota, locale.code),
                                        payment.quota,
                                        props.unit
                                    )}
                                </span>
                            ) : null}
                        </div>

                        <div className="fs-saas-starter-payments-section__download ml-auto">
                            <Button variant="outline" size="sm" asChild>
                                <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                    <PdfIcon />
                                    {locale.portal.payments.action.downloadInvoice()}
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </PaginatedList>
        </div>
    );
}
