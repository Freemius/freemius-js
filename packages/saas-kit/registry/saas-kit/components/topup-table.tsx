'use client';

import * as React from 'react';
import { CURRENCY, parseCurrency, parseNumber, PortalPlans, SellingUnit } from '@freemius/sdk';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '../utils/formatter';
import { useCheckout } from '../hooks/checkout';
import { useLocale } from '../utils/locale';
import { Button } from '@/components/ui/button';

type TopupTableData = {
    title: string;
    unitPrice: string;
    units: number;
    totalPrice: string;
    planId: string;
    pricingId: string;
    isFeatured?: boolean;
};

function TopupTableItem(props: { data: TopupTableData; sellingUnit: SellingUnit; onCheckout?: () => void }) {
    const { data, sellingUnit, onCheckout } = props;
    const checkout = useCheckout();
    const locale = useLocale();

    return (
        <Card className="relative flex flex-col h-full gap-2">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-xl font-semibold">{data.title}</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="flex flex-col items-center">
                    <div className="inline-flex flex-col flex-nowrap mb-2 justify-center items-center">
                        <div className="text-3xl font-bold">{data.totalPrice}</div>
                        <div className="text-sm text-muted-foreground mt-4">
                            {locale.pricing.topupUnitPrice(data.unitPrice, sellingUnit)}
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="mt-6">
                <Button
                    className="w-full"
                    variant={data.isFeatured ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => {
                        onCheckout?.();
                        checkout.open({
                            plan_id: data.planId,
                            pricing_id: data.pricingId,
                        });
                    }}
                >
                    {locale.pricing.action.purchase()}
                </Button>
            </CardFooter>
        </Card>
    );
}

export function TopupTable(props: {
    plan?: PortalPlans[number] | null;
    sellingUnit: SellingUnit;
    currency?: CURRENCY;
    onCheckout?: () => void;
}) {
    const { plan, currency = CURRENCY.USD, onCheckout, sellingUnit } = props;
    const locale = useLocale();

    const tableData: TopupTableData[] = React.useMemo(() => {
        const data: TopupTableData[] =
            plan?.pricing
                ?.filter(
                    (p) =>
                        parseCurrency(p.currency) === currency &&
                        // Must have one-off pricing
                        p.lifetime_price &&
                        true !== p.is_hidden
                )
                .map((pricing) => {
                    const topupData: TopupTableData = {
                        title: `${formatNumber(pricing.licenses!)} ${sellingUnit.plural}`,
                        unitPrice: formatCurrency(
                            (parseNumber(pricing.lifetime_price) ?? 0) / pricing.licenses!,
                            currency,
                            locale.code,
                            4
                        ),
                        units: pricing.licenses!,
                        totalPrice: formatCurrency(
                            parseNumber(pricing.lifetime_price) ?? 0 * pricing.licenses!,
                            currency,
                            locale.code
                        ),
                        planId: plan.id!,
                        pricingId: pricing.id!,
                    };

                    return topupData;
                }) ?? [];

        // Make the middle one featured (if there are at-least 3 items)
        if (data.length >= 3) {
            const midIndex = Math.floor(data.length / 2);
            data[midIndex].isFeatured = true;
        }

        return data;
    }, [plan?.pricing, plan?.id, currency, sellingUnit.plural, locale.code]);

    if (tableData.length === 0) {
        return <p>Error: Could not find any pricing in the topup plan.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tableData.map((pricing) => (
                <TopupTableItem
                    key={pricing.pricingId}
                    data={pricing}
                    sellingUnit={sellingUnit}
                    onCheckout={onCheckout}
                />
            ))}
        </div>
    );
}
