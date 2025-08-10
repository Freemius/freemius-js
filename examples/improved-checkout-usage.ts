/**
 * Example showing the improved CheckoutParamsBuilder API
 */

import { Freemius } from '../src';

const freemius = new Freemius('product-id', 'api-key', 'secret-key', 'public-key');

// Example user object (similar to what you'd get from auth session)
const user = {
    email: 'user@example.com',
    name: 'John Doe',
};

// BEFORE (old API - still works for backward compatibility):
const oldWay = freemius.checkout
    .params()
    .user(user) // Old method name (still works)
    .sandbox() // Old method name (still works)
    .recommended().param; // Old method name (still works) // ← Awkward ending (deprecated but still works)

// AFTER (improved API with better naming):
const newWay = freemius.checkout.params().withUser(user).inSandbox().withRecommendation().build(); // ← Natural ending

// More comprehensive example with the new API:
const comprehensiveExample = freemius.checkout
    .params()
    .withUser(user)
    .withPlan('pro-monthly')
    .withLicenses(5)
    .withCurrency('usd')
    .inSandbox()
    .withRecommendation()
    .withOptions({
        // Custom options can still be added
        success_url: 'https://myapp.com/success',
        cancel_url: 'https://myapp.com/cancel',
    })
    .build();

// Method chaining works in any order:
const flexibleOrder = freemius.checkout
    .params()
    .inSandbox()
    .withRecommendation()
    .withUser(user)
    .withPlan('enterprise')
    .build();

// Graceful handling of null/undefined users:
const withNullUser = freemius.checkout
    .params()
    .withUser(null) // This is handled gracefully
    .inSandbox()
    .build();

console.log('Old way:', oldWay);
console.log('New way:', newWay);
console.log('Comprehensive:', comprehensiveExample);
console.log('Flexible order:', flexibleOrder);
console.log('With null user:', withNullUser);
