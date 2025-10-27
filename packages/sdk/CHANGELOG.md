# @freemius/sdk

## 0.1.0

### Minor Changes

- b03580f: Support free trial in checkout overlay mode
- 0b5f0ed: Add alternate webhook authentication method.

    In some systems (especially in serverless environments), the raw request body may be altered (such as whitespace
    changes), which can lead to signature verification failures. To address this, we've introduced an alternative
    authentication method that retrieves the event directly from the Freemius API using the event ID provided in the
    payload.
    - **BREAKING**: The `freemius.webhook.createListener` method now accepts a configuration object.

- 8b99148: Support free trial in checkout redirection flow
- 0180d61: New feature to generate checkout upgrade flow

    Now you can create checkout flows specifically for upgrading existing licenses by providing a license ID.

    ```ts
    const checkout = await freemius.checkout.request.create({
        licenseId: existingLicenseId,
        // other options...
    });

    // OR
    const checkout = (await freemius.checkout.create()).setLicenseAuthorization(
        await freemius.checkout.getLicenseUpgradeParams('6')
    );
    ```

    **BREAKING**:
    - The `checkout.setSandbox` method now accepts the sandbox params. The same can be created by
      `await freemius.checkout.getSandboxParams()`.
    - The `setLicenseRenewal` has been renamed to `setLicenseUpgradeByKey` to better reflect its purpose.

### Patch Changes

- 37f5913: Fix checkout redirection bug

    The Checkout API processor was incorrectly checking for an `action` URL parameter. Also the timingSafeEqual function
    could throw in case of bad signature. Both issues are now fixed.

## 0.0.6

### Patch Changes

- d83396f: Update readme and installation instruction

## 0.0.3

### Patch Changes

- 12d5bd1: Update peer dependency to @freemius/checkout ^1.3.1

## 0.0.2

### Patch Changes

- dae9fcc: Refactor the entitlement and schema (pre-release)

## 0.0.2-next.0

### Patch Changes

- dae9fcc: Refactor the entitlement and schema (pre-release)
