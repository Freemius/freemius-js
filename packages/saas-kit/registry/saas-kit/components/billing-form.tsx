import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PortalData } from '@freemius/sdk';
import { useLocale } from '../utils/locale';
import { BillingRequest } from '@freemius/sdk';
import Spinner from '../icons/spinner';
import { Input } from '@/components/ui/input';
import { BillingItem } from './billing-item';
import { countriesOptions } from '../utils/country';
import { Combobox } from './combobox';

export function BillingForm(props: {
    billing: NonNullable<PortalData['billing']>;
    setIsUpdating: (isUpdating: boolean) => void;
    updateBilling: (billing: BillingRequest) => Promise<void>;
}) {
    const { billing, setIsUpdating, updateBilling } = props;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const locale = useLocale();
    const formRef = React.useRef<HTMLFormElement>(null);

    // Focus the first input when the form is rendered
    React.useEffect(() => {
        if (formRef.current) {
            const firstInput = formRef.current.querySelector('input, textarea');
            if (firstInput) {
                (firstInput as HTMLInputElement).focus();
            }
        }
    }, []);

    // Form state
    const [formData, setFormData] = React.useState({
        business_name: billing.business_name ?? '',
        tax_id: billing.tax_id ?? '',
        phone: billing.phone ?? '',
        address_apt: billing.address_apt ?? '',
        address_street: billing.address_street ?? '',
        address_city: billing.address_city ?? '',
        address_state: billing.address_state ?? '',
        address_country_code: billing.address_country_code ?? '',
        address_zip: billing.address_zip ?? '',
    });

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const onUpdate = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setIsLoading(true);

            // Create payload with only non-empty fields
            const payload: BillingRequest = {};

            if (formData.business_name.trim()) {
                payload.business_name = formData.business_name.trim();
            }
            if (formData.phone.trim()) {
                payload.phone = formData.phone.trim();
            }
            if (formData.tax_id.trim()) {
                payload.tax_id = formData.tax_id.trim();
            }
            if (formData.address_street.trim()) {
                payload.address_street = formData.address_street.trim();
            }
            if (formData.address_apt.trim()) {
                payload.address_apt = formData.address_apt.trim();
            }
            if (formData.address_city.trim()) {
                payload.address_city = formData.address_city.trim();
            }
            if (formData.address_country_code.trim()) {
                payload.address_country_code = formData.address_country_code.trim();
            }
            if (formData.address_state.trim()) {
                payload.address_state = formData.address_state.trim();
            }
            if (formData.address_zip.trim()) {
                payload.address_zip = formData.address_zip.trim();
            }

            await updateBilling(payload);
            setIsUpdating(false);
        } catch (error) {
            console.error('Failed to update billing information:', error);
            if (error instanceof Error && typeof window !== 'undefined') {
                window.alert('Failed to update billing information: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={onUpdate} className="space-y-4" ref={formRef}>
            <div className="fs-saas-starter-billing-section__form flex flex-col gap-4">
                <BillingItem
                    label={locale.portal.billing.label.businessName()}
                    value={
                        <Input
                            type="text"
                            value={formData.business_name}
                            onChange={(e) => handleInputChange('business_name', e.target.value)}
                            placeholder="Enter business name"
                        />
                    }
                />
                <BillingItem
                    label={locale.portal.billing.label.phone()}
                    value={
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                        />
                    }
                />

                <BillingItem
                    label={locale.portal.billing.label.tax()}
                    value={
                        <Input
                            type="text"
                            value={formData.tax_id}
                            onChange={(e) => handleInputChange('tax_id', e.target.value)}
                            placeholder="Enter tax ID"
                        />
                    }
                />

                <BillingItem
                    label={locale.portal.billing.label.address()}
                    value={
                        <div className="flex flex-col gap-2">
                            <Input
                                type="text"
                                value={formData.address_street}
                                onChange={(e) => handleInputChange('address_street', e.target.value)}
                                placeholder="Street address"
                            />
                            <Input
                                type="text"
                                value={formData.address_apt}
                                onChange={(e) => handleInputChange('address_apt', e.target.value)}
                                placeholder="Apartment, suite, etc. (optional)"
                            />
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={formData.address_city}
                                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                                    placeholder="City"
                                    className="flex-1"
                                />
                                <Input
                                    type="text"
                                    value={formData.address_state}
                                    onChange={(e) => handleInputChange('address_state', e.target.value)}
                                    placeholder="State"
                                    className="flex-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={formData.address_zip}
                                    onChange={(e) => handleInputChange('address_zip', e.target.value)}
                                    placeholder="ZIP/Postal code"
                                    className="flex-1"
                                />
                                <Combobox
                                    options={countriesOptions}
                                    value={formData.address_country_code.toUpperCase()}
                                    onValueChange={(value) => handleInputChange('address_country_code', value)}
                                    placeholder="Select country"
                                    searchPlaceholder="Search countries..."
                                    emptyMessage="No country found."
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    }
                />
            </div>

            <div className="mt-4 flex gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner /> : null}
                    {locale.portal.billing.action.save()}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsUpdating(false)} disabled={isLoading}>
                    {locale.portal.billing.action.cancel()}
                </Button>
            </div>
        </form>
    );
}
