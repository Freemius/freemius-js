import { PortalAction } from '../contracts/portal';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';
import { BillingAction } from './BillingAction';
import { InvoiceAction } from './InvoiceAction';
import { SubscriptionCancellationAction } from './SubscriptionCancellationAction';
import { SubscriptionRenewalCouponAction } from './SubscriptionRenewalCouponAction';

export class CustomerPortalActionService {
    public readonly invoice: InvoiceAction;
    public readonly billing: BillingAction;
    public readonly renewalCoupon: SubscriptionRenewalCouponAction;
    public readonly cancelRenewal: SubscriptionCancellationAction;

    constructor(
        private readonly api: ApiService,
        private readonly authService: AuthService
    ) {
        this.invoice = new InvoiceAction(this.api, this.authService);
        this.billing = new BillingAction(this.api, this.authService);
        this.renewalCoupon = new SubscriptionRenewalCouponAction(this.api, this.authService);
        this.cancelRenewal = new SubscriptionCancellationAction(this.api, this.authService);
    }

    getAllHandlers(): PortalAction[] {
        return [this.invoice, this.billing, this.renewalCoupon, this.cancelRenewal];
    }
}
