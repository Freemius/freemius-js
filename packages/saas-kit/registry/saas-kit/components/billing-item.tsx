import * as React from 'react';

export function BillingItem(props: { label: React.ReactNode; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-1 md:gap-2 items-start">
            <div className="text-muted-foreground text-sm font-semibold">{props.label}</div>
            <div>{props.value}</div>
        </div>
    );
}
