---
'@freemius/sdk': minor
---

New API method to generate license upgrade flow

Previously we only exposed the `freemius.api.license.retrieveCheckoutUpgradeAuthorization` method, which returned a
license upgrade authorization token. This token was then used to create a checkout flow for license upgrades.

Now we have added a new method `freemius.api.license.retrieveCheckoutUpgrade` that returns the full
[API Response](https://freemius.com/help/api/licenses/generate-upgrade-link/) for the license upgrade flow, including
the checkout link and config for the
[overlay checkout](https://freemius.com/help/documentation/checkout/integration/overlay-checkout/).
