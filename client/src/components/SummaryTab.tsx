import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkout } from "../types/checkout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface SummaryTabProps {
  checkoutData: Checkout;
}

export default function SummaryTab({ checkoutData }: SummaryTabProps) {
  const checkout = checkoutData.data;
  const cart = checkout.cart;
  const physicalItems = cart.line_items.physical_items || [];
  const digitalItems = cart.line_items.digital_items || [];
  const allItems = [...physicalItems, ...digitalItems];
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    const currencyCode = cart.currency?.code || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Checkout Overview Card */}
        <Card className="border border-neutral-200 bg-neutral-50">
          <CardContent className="p-4">
            <CardTitle className="text-sm font-semibold text-neutral-700 mb-3">
              Checkout Overview
            </CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">ID:</span>
                <span className="text-sm font-mono">{checkout.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Created:</span>
                <span className="text-sm">{formatDate(checkout.created_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Updated:</span>
                <span className="text-sm">{formatDate(checkout.updated_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Customer:</span>
                <span className="text-sm">{cart.email || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Cart Summary Card */}
        <Card className="border border-neutral-200 bg-neutral-50">
          <CardContent className="p-4">
            <CardTitle className="text-sm font-semibold text-neutral-700 mb-3">
              Cart Summary
            </CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Subtotal:</span>
                <span className="text-sm">{formatCurrency(checkout.subtotal_inc_tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Shipping:</span>
                <span className="text-sm">{formatCurrency(checkout.shipping_cost_total_inc_tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Tax:</span>
                <span className="text-sm">{formatCurrency(checkout.tax_total)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-sm text-neutral-800">Grand Total:</span>
                <span className="text-sm">{formatCurrency(checkout.grand_total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Shipping Card */}
        {checkout.consignments && checkout.consignments.length > 0 && (
          <Card className="border border-neutral-200 bg-neutral-50">
            <CardContent className="p-4">
              <CardTitle className="text-sm font-semibold text-neutral-700 mb-3">
                Shipping Information
              </CardTitle>
              <div className="space-y-2 text-sm">
                <div>
                  <span>
                    {checkout.consignments[0].address.first_name} {checkout.consignments[0].address.last_name}
                  </span>
                </div>
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
                {checkout.consignments[0].selected_shipping_option && (
                  <div className="pt-2 text-neutral-500">
                    <span>Method: </span>
                    <span>{checkout.consignments[0].selected_shipping_option.description}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Line Items Table */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Line Items</h3>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Product</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">SKU</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Price</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Quantity</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-neutral-500">
                    No items in this checkout
                  </TableCell>
                </TableRow>
              ) : (
                allItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {item.image_url && (
                          <div className="h-10 w-10 rounded-md bg-neutral-100 flex-shrink-0 mr-3">
                            <img 
                              src={item.image_url} 
                              className="h-10 w-10 object-cover rounded-md" 
                              alt={item.name} 
                            />
                          </div>
                        )}
                        <div>{item.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                      {item.sku || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      {formatCurrency(item.sale_price)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                      {formatCurrency(item.extended_sale_price)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
