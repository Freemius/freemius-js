---
'@freemius/sdk': minor
---

Checkout builder now supports proper types for currency and language

Previously the `setCurrency` method only supported 'usd', 'eur', 'gbp' or 'auto' as currency values, and the
`setLanguage` method only supported 'auto', 'auto-beta' or any string as language value.

Now they have been updated to support proper types for currency and language, including the new
`CheckoutCurrencyWithAuto` and `CheckoutLocaleValue` types.
