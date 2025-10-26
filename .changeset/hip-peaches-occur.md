---
'@freemius/sdk': minor
---

Add alternate webhook authentication method.

In some systems (especially in serverless environments), the raw request body may be altered (such as whitespace
changes), which can lead to signature verification failures. To address this, we've introduced an alternative
authentication method that retrieves the event directly from the Freemius API using the event ID provided in the
payload.

- BREAKING: The `freemius.webhook.createListener` method now accepts a configuration object.
