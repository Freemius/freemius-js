export class RouteError extends Error {
    public readonly status: number;
    public readonly cause?: { code: string };

    constructor(message: string, code: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'RouteError';
        this.cause = { code };
    }

    toResponseJson(): Response {
        return Response.json(
            {
                code: this.cause?.code ?? 'internal_server_error',
                message: this.message,
            },
            { status: this.status }
        );
    }
}
