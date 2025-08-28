'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const items = [1, 2, 3];

export function PricingSkeleton(props: { type?: 'subscription' | 'topup' }) {
    const { type = 'subscription' } = props;
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => (
                <Card key={item}>
                    <CardHeader>
                        <Skeleton className="h-20" />
                    </CardHeader>
                    <CardContent>
                        {type === 'subscription' ? (
                            <Skeleton className={`h-40 mb-5`} />
                        ) : (
                            <Skeleton className={`h-8 mb-5`} />
                        )}
                        <Skeleton className="h-10" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
