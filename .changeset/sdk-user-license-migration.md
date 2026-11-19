---
'@freemius/sdk': minor
---

Add `freemius.api.user.migrate()` and `freemius.api.license.migrate()` to import customers and licenses from another
platform. Both methods accept a shared `MigrationSource` and an endpoint-specific typed payload. They return the user or
license from Freemius, or `null` if the API rejects the request.

For example, migrate a Lemon Squeezy customer and preserve their existing lifetime license key.

```ts
import { MigrationSource } from '@freemius/sdk';

const source = MigrationSource.LEMON_SQUEEZY;
const user = await freemius.api.user.migrate(source, { email, name });

if (user) {
    await freemius.api.license.migrate(source, {
        email,
        plan_id: planId,
        pricing_id: pricingId,
        period: 0,
        license_key: legacyLicenseKey,
    });
}
```
