
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: 'Mains' | 'Drinks' | 'Sides';
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
  assignedRiderId?: string;
  status: 'placed' | 'pending' | 'confirmed' | 'awaiting_confirmation' | 'delivered' | 'cancelled';
  timestamp: Date;
  customerName?: string;
  customerNumber?: string;
  customerLocation?: {
    address: string;
    coordinates: [number, number];
  };
  paymentMethod?: 'Cash' | 'MoMo';
  customerUserId?: string;
  confirmedAt?: Date;
  estimatedReadyTime?: Date;
  riderAcceptedAt?: Date;
  confirmedBySessionId?: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  adminName: string;
  startedAt: Date;
  endedAt?: Date;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  orderId: string;
  type: 'new_order' | 'order_confirmed' | 'order_ready' | 'rider_assigned';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface DailySummary {
  totalOrders: number;
  totalRevenue: number;
  bestSelling: MenuItem | null;
  worstSelling: MenuItem | null;
  ordersByMeal: Record<string, number>;
  revenueByMeal: Record<string, number>;
}
