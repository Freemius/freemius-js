export class ActionError extends Error {
    public readonly statusCode: number;
    public readonly validationIssues?: unknown;

    constructor(message: string, statusCode: number = 400, validationIssues?: unknown) {
        super(message);
        this.name = 'ActionError';
        this.statusCode = statusCode;
        this.validationIssues = validationIssues;
    }

    toResponse(): Response {
        const errorResponse: Record<string, unknown> = {
            message: this.message,
        };

        if (this.validationIssues) {
            errorResponse.issues = this.validationIssues;
        }

        return Response.json(errorResponse, { status: this.statusCode });
    }

    // Essential factory methods
    static badRequest(message: string): ActionError {
        return new ActionError(message, 400);
    }

    static unauthorized(message: string = 'Unauthorized'): ActionError {
        return new ActionError(message, 401);
    }

    static notFound(message: string = 'Not found'): ActionError {
        return new ActionError(message, 404);
    }

    static validationFailed(message: string, validationIssues: unknown): ActionError {
        return new ActionError(message, 400, validationIssues);
    }

    static internalError(message: string = 'Internal server error'): ActionError {
        return new ActionError(message, 500);
    }
}
