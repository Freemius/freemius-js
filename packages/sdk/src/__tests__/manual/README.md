Use VSCode launch to work with any manual tests. You will need to have an `.env` file with the following variables set:

```plaintext
FREEMIUS_PRODUCT_ID=<your_product_id>
FREEMIUS_PUBLIC_KEY=<product_public_key>
FREEMIUS_SECRET_KEY=<product_secret_key
FREEMIUS_API_KEY=<product_api_key>
```

To connect to the local development server (for Freemius team members only), set the following variable:

```plaintext
FREEMIUS_INTERNAL__IS_DEVELOPMENT_MODE=true
```
