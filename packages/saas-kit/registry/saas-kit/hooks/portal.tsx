import { useContext, createContext } from 'react';

export type PortalContextType = null | {
    endpoint: string;
};

export const PortalContext = createContext<PortalContextType>(null);

export function usePortalEndpoint(): string {
    const context = useContext(PortalContext);

    if (!context) {
        throw new Error('usePortalEndpoint must be used within a PortalProvider');
    }

    return context.endpoint;
}
