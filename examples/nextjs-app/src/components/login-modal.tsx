'use client';

import { useEffect, useMemo, useState } from 'react';
import SignIn from './sign-in';
import SignUp from './sign-up';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabKey = 'sign-in' | 'sign-up';

type LoginModalProps = {
    isShowing: boolean;
    onClose: () => void;
    defaultTab?: TabKey;
};

export default function LoginModal({ isShowing, onClose, defaultTab = 'sign-in' }: LoginModalProps) {
    const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

    // Reset tab to default when the modal opens
    useEffect(() => {
        if (isShowing) setActiveTab(defaultTab);
    }, [defaultTab, isShowing]);

    const tabs = useMemo(
        () => [
            { key: 'sign-in' as TabKey, label: 'Sign in' },
            { key: 'sign-up' as TabKey, label: 'Sign up' },
        ],
        []
    );

    return (
        <Dialog open={isShowing} onOpenChange={(open) => !open && onClose()}>
            {/* Custom overlay to ensure blurred background */}
            <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-md">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="mt-2 w-full">
                    <DialogHeader>
                        <DialogTitle>Please login to continue</DialogTitle>
                        <TabsList className="grid w-full grid-cols-2">
                            {tabs.map((t) => (
                                <TabsTrigger key={t.key} value={t.key}>
                                    {t.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </DialogHeader>

                    <TabsContent value="sign-in" className="mt-4">
                        <SignIn onSuccess={onClose} />
                    </TabsContent>
                    <TabsContent value="sign-up" className="mt-4">
                        <SignUp onSuccess={onClose} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
