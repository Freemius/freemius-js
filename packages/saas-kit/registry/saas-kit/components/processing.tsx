import * as React from 'react';
import { ReactNode } from 'react';
import Spinner from '../icons/spinner';

export default function Processing(props: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-5000 flex items-center justify-center bg-foreground/50 backdrop-blur-md">
            <div className="flex flex-col gap-4 w-sm max-w-[80vw] p-8 bg-card rounded-md shadow-lg items-center justify-center">
                <Spinner className="size-8" />
                <p className="text-lg font-semibold text-muted-foreground">{props.children}</p>
            </div>
        </div>
    );
}
