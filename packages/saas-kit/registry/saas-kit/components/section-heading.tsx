import * as React from 'react';
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading(props: ComponentProps<'h2'>) {
    const { className, ...rest } = props;

    return (
        <h2
            className={cn(
                'text-sm pb-4 border-b border-b-muted border-solid text-muted-foreground uppercase font-semibold mb-4',
                className
            )}
            {...rest}
        ></h2>
    );
}
