import assert from 'node:assert/strict';
import { MigrationSource } from '../../index';
import { freemius } from './fs';

async function main() {
    const {
        MIGRATION_EMAIL: email,
        MIGRATION_PLAN_ID: planId,
        MIGRATION_PRICING_ID: pricingId,
        MIGRATION_LICENSE_KEY: licenseKey,
    } = process.env;

    assert(email && planId && pricingId && licenseKey, 'Set the four MIGRATION_* variables in the manual test README.');

    const source = MigrationSource.LEMON_SQUEEZY;
    const user = await freemius.api.user.migrate(source, {
        email,
        name: 'SDK Migration Test',
        is_marketing_allowed: false,
    });
    assert(user?.id, 'User migration failed.');
    console.log(`Migrated user ${user.id}`);

    const license = await freemius.api.license.migrate(source, {
        plan_id: planId,
        pricing_id: pricingId,
        email,
        period: 0,
        license_key: licenseKey,
        send_email: false,
    });
    assert(license?.id, 'License migration failed.');
    assert.equal(license.user_id, user.id, 'The license belongs to a different user.');
    assert.equal(license.source, 11, 'The license source should be Lemon Squeezy.');
    assert(license.secret_key === licenseKey, 'The license key changed.');
    console.log(`Migrated license ${license.id}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
