---
'@freemius/sdk': minor
---

New feature to generate checkout upgrade flow

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

BREAKING:

- The `checkout.setSandbox` method now accepts the sandbox params. The same can be created by
  `await freemius.checkout.getSandboxParams()`.
- The `setLicenseRenewal` has been renamed to `setLicenseUpgradeByKey` to better reflect its purpose.
