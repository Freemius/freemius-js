---
'@freemius/sdk': patch
---

Fix checkout redirection bug

The Checkout API processor was incorrectly checking for an `action` URL parameter. Also the timingSafeEqual function
could throw in case of bad signature. Both issues are now fixed.
