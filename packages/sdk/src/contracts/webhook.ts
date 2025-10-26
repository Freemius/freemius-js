export type WebhookListenerResponse = {
    status: number;
} & ({ success: true } | { success: false; error: string });

export enum WebhookAuthenticationMethod {
    SignatureHeader = 'SignatureHeader',
    Api = 'Api',
}
