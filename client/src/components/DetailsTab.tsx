import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkout } from "../types/checkout";
import { Separator } from "@/components/ui/separator";

interface DetailsTabProps {
  checkoutData: Checkout;
}

export default function DetailsTab({ checkoutData }: DetailsTabProps) {
  const checkout = checkoutData.data;
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    const currencyCode = checkout.cart.currency?.code || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Address */}
        {checkout.billing_address && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Billing Address</h3>
            <Card className="border border-neutral-200 bg-neutral-50">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span>
                      {checkout.billing_address.first_name} {checkout.billing_address.last_name}
                    </span>
                  </div>
                  {checkout.billing_address.company && (
                    <div>
                      <span>{checkout.billing_address.company}</span>
                    </div>
                  )}
                  <div>
                    <span>{checkout.billing_address.address1}</span>
                  </div>
                  {checkout.billing_address.address2 && (
                    <div>
                      <span>{checkout.billing_address.address2}</span>
                    </div>
                  )}
                  <div>
                    <span>{checkout.billing_address.city}</span>
                    {checkout.billing_address.state_or_province_code && (
                      <span>, {checkout.billing_address.state_or_province_code}</span>
                    )}
                    {checkout.billing_address.postal_code && (
                      <span> {checkout.billing_address.postal_code}</span>
                    )}
                  </div>
                  {checkout.billing_address.country && (
                    <div>
                      <span>{checkout.billing_address.country}</span>
                    </div>
                  )}
                  {checkout.billing_address.phone && (
                    <div>
                      <span>Phone: {checkout.billing_address.phone}</span>
                    </div>
                  )}
                  {checkout.billing_address.email && (
                    <div>
                      <span>Email: {checkout.billing_address.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Consignments & Shipping */}
        {checkout.consignments && checkout.consignments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Shipping Details</h3>
            <Card className="border border-neutral-200 bg-neutral-50">
              <CardContent className="p-4">
                {checkout.consignments[0].selected_shipping_option && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">
                      Selected Shipping Option
                    </h4>
                    <div className="pl-3 border-l-2 border-[#34B3E4]">
                      <div className="text-sm font-medium">
                        {checkout.consignments[0].selected_shipping_option.description}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {formatCurrency(checkout.consignments[0].selected_shipping_option.cost)}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">
                    Shipping Address
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span>
                        {checkout.consignments[0].address.first_name} {checkout.consignments[0].address.last_name}
                      </span>
                    </div>
                    {checkout.consignments[0].address.company && (
                      <div>
                        <span>{checkout.consignments[0].address.company}</span>
                      </div>
                    )}
                    <div>
                      <span>{checkout.consignments[0].address.address1}</span>
                    </div>
                    {checkout.consignments[0].address.address2 && (
                      <div>
                        <span>{checkout.consignments[0].address.address2}</span>
                      </div>
                    )}
                    <div>
                      <span>
                        {checkout.consignments[0].address.city}, 
                        {checkout.consignments[0].address.state_or_province_code} 
                        {checkout.consignments[0].address.postal_code}
                      </span>
                    </div>
                    <div>
                      <span>{checkout.consignments[0].address.country}</span>
                    </div>
                    {checkout.consignments[0].address.phone && (
                      <div>
                        <span>Phone: {checkout.consignments[0].address.phone}</span>
                      </div>
                    )}
                    {checkout.consignments[0].address.email && (
                      <div>
                        <span>Email: {checkout.consignments[0].address.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Coupons & Discounts Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Coupons & Discounts</h3>
        <Card className="border border-neutral-200 bg-neutral-50">
          <CardContent className="p-4">
            {checkout.coupons && checkout.coupons.length > 0 ? (
              checkout.coupons.map((coupon) => (
                <div key={coupon.id} className="mb-3 last:mb-0 p-3 bg-neutral-100 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{coupon.display_name}</div>
                      <div className="text-sm text-neutral-500">Code: {coupon.code}</div>
                    </div>
                    <div className="text-[#00AB6C] font-medium">
                      -{formatCurrency(coupon.discounted_amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-500 text-sm py-2">
                No coupons applied to this checkout.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Taxes Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Tax Information</h3>
        <Card className="border border-neutral-200 bg-neutral-50">
          <CardContent className="p-4">
            {checkout.taxes && checkout.taxes.length > 0 ? (
              checkout.taxes.map((tax, index) => (
                <div key={index} className="flex justify-between items-center p-2">
                  <div className="text-sm">{tax.name}</div>
                  <div className="text-sm font-medium">{formatCurrency(tax.amount)}</div>
                </div>
              ))
            ) : (
              <div className="text-neutral-500 text-sm py-2">
                No tax information available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
