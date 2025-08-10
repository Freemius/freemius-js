import { IconSparkles } from '@tabler/icons-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <span className="w-10 h-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                <IconSparkles className="!size-6" />
            </span>
            <span className="text-xl font-semibold">Awesome AI</span>
        </div>
    );
}
