'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useCheckout } from '@/react-starter/hooks/checkout';

export default function CheckoutDemo() {
    const checkout = useCheckout();
    const [selectedPlan, setSelectedPlan] = React.useState<string>(
        process.env.NEXT_PUBLIC_FREEMIUS_PLAN_ID_PROFESSIONAL!
    );

    const plans = [
        {
            id: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_ID_STARTER!,
            name: 'Starter',
        },
        {
            id: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_ID_PROFESSIONAL!,
            name: 'Professional',
        },
        {
            id: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_ID_BUSINESS!,
            name: 'Business',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Plan Selection */}
            <div>
                <h3 className="text-sm font-medium mb-3">Select Plan</h3>
                <div className="flex flex-wrap gap-2">
                    {plans.map((plan) => (
                        <Button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            variant={selectedPlan === plan.id ? 'default' : 'outline'}
                        >
                            {plan.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Checkout Actions */}
            <div>
                <h3 className="text-sm font-medium mb-3">Trigger the Checkout</h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() =>
                            checkout.open({
                                plan_id: selectedPlan,
                            })
                        }
                    >
                        Purchase
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Start Trial
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() =>
                                    checkout.open({
                                        plan_id: selectedPlan,
                                        trial: 'free',
                                    })
                                }
                            >
                                Free Trial
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    checkout.open({
                                        plan_id: selectedPlan,
                                        trial: 'paid',
                                    })
                                }
                            >
                                Paid Trial
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
