
export interface Category {
    id: number;
    name: string;
}

export interface Settings {
    id: number;
    business_name: string;
    store_logo: string | null;
    currency: string;
    receipt_footer: string;
    timezone: string;
    backup_enabled: boolean;
    backup_provider: string;
}

export interface TaxType {
    id: number;
    name: string;
    rate: string;
    active: boolean;
}

export interface Discount {
    id: number;
    name: string;
    discount: string;
}

export interface Warehouse {
    id: number;
    name: string;
    location: string;
}

export interface Product {
    discount_name: string;
    taxes_names: any;
    category_name: string[];
    warehouse_name: string[];
    id: number;
    name: string;
    sku: string;
    brand: string;
    net_cost: string;
    selling_price_without_tax: string;
    discount: number | null;
    current_stock: number;
    minimum_stock_level: number;
    image: string | null;
    barcode_number: string | null;
    taxes: number[];
    category: number;
    warehouse: number;
}

export interface Supplier {
    id: number;
    name: string;
    products: number[];
    phone_number: string;
    email: string;
    address: string;
    contact_person: string;
    tax_number: string;
    product_names: string[];
}

export interface PurchaseOrder {
    id: number;
    supplier: number;
    expected_delivery: string;
    status: string;
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order: number;
    product: number;
    quantity: string;
}

export interface Customer {
    id: number;
    user: number;
    first_name: string | null;
    second_name: string | null;
    reward_points: string;
    credit_balance: string;
}

export interface OrderHistory {
    id: number;
    customer: number | null;
    time_of_purchase: string;
}

export interface QuantityOfAnItemBought {
    id: number;
    order: number;
    product: number;
    amount_bought: string;
}

export interface Branch {
    id: number;
    name: string;
    location: string;
}

export interface Cashier {
    id: number;
    user: number | null;
    first_name: string | null;
    second_name: string | null;
    date_employed: string;
    branch_stationed_at: number;
}

export interface Notification {
    id: number;
    notification_type: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    created_at: string;
    target_audience: string;
    excluded_users: number[];
}

export interface AnnouncementReadStatus {
    id: number;
    announcement: number;
    user: number;
    read_at: string;
}

export interface AuditLog {
    id: number;
    user: number | null;
    actions: string;
}

export interface Receipt {
    id: number;
    order_history: number;
    receipt_number: string;
    cashier: number;
    settings: number;
}

export interface StockMovement {
    id: number;
    product: number;
    quantity: number;
    movement_type: string;
    date: string;
    performed_by: number;
    reason: string;
}

export interface Return {
    id: number;
    product: number;
    customer: number | null;
    stock_movement: number;
}

export interface Payment {
    id: number;
    order: number;
    amount: string;
    method: string;
    paid_at: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}