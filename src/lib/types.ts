export type Category = { id: string; name: string; slug: string };

export type Product = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  /** Selling price per unit, GST-inclusive, in INR. */
  price: number;
  /** Optional lower price for contractor accounts, GST-inclusive. */
  contractorPrice?: number;
  /** Plain-text label such as "per bag" or "per kg". */
  unitLabel: string;
  gstRate: number;
  hsn: string;
  stock: number;
  active: boolean;
  imageUrl?: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  passwordHash: string;
  type: "retail" | "contractor";
  gstin?: string;
  createdAt: string;
};

export type Admin = { id: string; name: string; phone: string; passwordHash: string };

export type Fulfilment = "delivery" | "pickup";
export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "unpaid" | "paid";
export type OrderStatus = "placed" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  brand: string;
  unitLabel: string;
  qty: number;
  unitPrice: number; // GST-inclusive
  gstRate: number;
  hsn: string;
  taxable: number; // line taxable value
  gst: number; // line GST
  lineTotal: number; // GST-inclusive line total
};

export type Order = {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType: "retail" | "contractor";
  gstin?: string;
  fulfilment: Fulfilment;
  address?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number | null;
  items: OrderItem[];
  itemsTotal: number; // GST-inclusive
  deliveryFee: number; // GST-inclusive
  deliveryGst: number;
  deliveryTaxable: number;
  taxableTotal: number;
  gstTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  storeName: string;
  gstin: string;
  address: string;
  stateName: string;
  stateCode: string;
  phone: string;
  lat: number;
  lng: number;
  deliveryBaseFee: number;
  deliveryPerKm: number;
  deliveryMinOrder: number;
  deliveryMaxKm: number;
  invoiceCounter: number;
};

export type Db = {
  settings: Settings;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  admins: Admin[];
  orders: Order[];
};
