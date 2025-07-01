
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: 'Mains' | 'Drinks';
  description?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  orderType: 'pickup' | 'delivery';
  riderNumber?: string;
  status: 'pending' | 'delivered' | 'cancelled';
  timestamp: Date;
  customerName?: string;
  customerNumber?: string;
  customerLocation?: {
    address: string;
    coordinates: [number, number];
  };
  paymentMethod?: 'Cash' | 'MoMo';
}

export interface DailySummary {
  totalOrders: number;
  totalRevenue: number;
  bestSelling: MenuItem | null;
  worstSelling: MenuItem | null;
  ordersByMeal: Record<string, number>;
  revenueByMeal: Record<string, number>;
}
