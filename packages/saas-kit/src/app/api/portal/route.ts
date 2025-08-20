import { freemius } from '@/lib/freemius';

export async function GET(request: Request): Promise<Response> {
    return await freemius.customerPortal.processAction(request);
}

export async function POST(request: Request): Promise<Response> {
    return await freemius.customerPortal.processAction(request);
}
