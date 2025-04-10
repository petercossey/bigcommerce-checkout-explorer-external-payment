export interface Checkout {
  data: {
    id: string;
    cart: Cart;
    billing_address?: Address;
    consignments?: Consignment[];
    taxes?: Tax[];
    coupons?: Coupon[];
    shipping_cost_total_inc_tax: number;
    shipping_cost_total_ex_tax: number;
    handling_cost_total_inc_tax: number;
    handling_cost_total_ex_tax: number;
    tax_total: number;
    subtotal_inc_tax: number;
    subtotal_ex_tax: number;
    grand_total: number;
    created_time?: string;
    updated_time?: string;
    customer_message?: string;
  };
  meta?: any;
}

export interface Cart {
  id: string;
  customer_id?: number;
  channel_id?: number;
  email?: string;
  currency?: {
    code: string;
  };
  base_amount: number;
  discount_amount: number;
  cart_amount_inc_tax: number;
  cart_amount_ex_tax: number;
  coupons?: Coupon[];
  discounts?: Discount[];
  line_items: {
    physical_items?: LineItem[];
    digital_items?: LineItem[];
    gift_certificates?: GiftCertificate[];
    custom_items?: CustomItem[];
  };
  created_time?: string;
  updated_time?: string;
}

export interface LineItem {
  id: string;
  parent_id?: number;
  variant_id?: number;
  product_id?: number;
  sku?: string;
  name: string;
  url?: string;
  quantity: number;
  is_taxable?: boolean;
  image_url?: string;
  discounts?: Discount[];
  coupons?: Coupon[];
  discount_amount?: number;
  coupon_amount?: number;
  original_price?: number;
  list_price: number;
  sale_price: number;
  extended_list_price: number;
  extended_sale_price: number;
  is_require_shipping?: boolean;
  gift_wrapping?: any;
}

export interface Discount {
  id: string;
  discounted_amount: number;
}

export interface Coupon {
  id: number;
  code: string;
  coupon_type: string;
  display_name: string;
  discounted_amount: number;
}

export interface GiftCertificate {
  id: string;
  name: string;
  theme: string;
  amount: number;
  is_taxable: boolean;
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  message: string;
}

export interface CustomItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  list_price: number;
}

export interface Address {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state_or_province?: string;
  state_or_province_code?: string;
  country?: string;
  country_code?: string;
  postal_code?: string;
  phone?: string;
  custom_fields?: {
    field_id: string;
    field_value: string;
  }[];
}

export interface Consignment {
  id: string;
  shipping_cost_inc_tax: number;
  shipping_cost_ex_tax: number;
  handling_cost_inc_tax: number;
  handling_cost_ex_tax: number;
  coupon_discounts?: Discount[];
  discounts?: Discount[];
  line_item_ids: string[];
  selected_shipping_option?: ShippingOption;
  available_shipping_options?: ShippingOption[];
  address: Address;
}

export interface ShippingOption {
  id: string;
  type: string;
  description: string;
  image_url?: string;
  cost: number;
  transit_time?: string;
  additional_description?: string;
}

export interface Tax {
  name: string;
  amount: number;
}
