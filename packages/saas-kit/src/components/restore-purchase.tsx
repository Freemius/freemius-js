import { useState } from 'react';
import { IconCircleCheck, IconAlertCircle, IconLoader2, IconRefresh } from '@tabler/icons-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function RestorePurchase() {
    const [restoring, setRestoring] = useState<boolean>(false);
    const router = useRouter();

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const response = await fetch('/api/restore-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to restore purchase');
            }

            const data = await response.json();
            const credits = data.credits ?? 0;
            toast.success(`Restored purchase with ${credits} credits!`, {
                icon: <IconCircleCheck className="w-6 h-6 text-grow" />,
                description: 'You can now use the feature you just purchased.',
            });
            router.refresh();
        } catch (error) {
            console.error('Error syncing purchase:', error);
            toast.error(`Could not restore your purchase!`, {
                description: `Please contact support. Any money spent will be refunded.`,
                icon: <IconAlertCircle className="w-6 h-6 text-destructive" />,
            });
        } finally {
            setRestoring(false);
        }
    };

    return (
        <Button onClick={handleRestore} disabled={restoring}>
            {restoring ? (
                <>
                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                </>
            ) : (
                <>
                    <IconRefresh className="w-4 h-4 mr-2" />
                    Restore Purchase
                </>
            )}
        </Button>
    );
}
