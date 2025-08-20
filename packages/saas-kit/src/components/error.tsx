'use client'; // Error boundaries must be Client Components

import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <Alert className="text-xl">
            <AlertTitle className="mb-4">Something went wrong</AlertTitle>
            <AlertDescription>
                <p>
                    We had some trouble loading the page. Please try again later or contact support if the issue
                    persists.
                </p>
                {error.digest ? <p className="mt-2">{`(Error Digest: ${error.digest})`}</p> : ''}
                <p className="mt-2">
                    <Button onClick={() => reset()} variant="outline">
                        Try Again
                    </Button>
                </p>
            </AlertDescription>
        </Alert>
    );
}

// Class-based Error Boundary that uses the Error function component for rendering
type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    error: (Error & { digest?: string }) | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: null };
        this.reset = this.reset.bind(this);
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can log errorInfo to an error reporting service here
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    reset() {
        this.setState({ error: null });
    }

    render() {
        if (this.state.error) {
            return <Error error={this.state.error} reset={this.reset} />;
        }
        return this.props.children;
    }
}
