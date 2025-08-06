Use VSCode launch to work with any manual tests. You will need to have an `.env` file with the following variables set:

```plaintext
FS__PRODUCT_ID=<your_product_id>
FS__PUBLIC_KEY=<product_public_key>
FS__SECRET_KEY=<product_secret_key
FS__API_KEY=<product_api_key>
```

To connect to the local development server (for Freemius team members only), set the following variable:

```plaintext
FS__INTERNAL__IS_DEVELOPMENT_MODE=true
```
