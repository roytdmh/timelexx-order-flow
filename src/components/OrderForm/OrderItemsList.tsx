
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Plus } from 'lucide-react';
import { OrderItem } from '@/types';

interface OrderItemsListProps {
  currentOrder: OrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({
  currentOrder,
  onUpdateQuantity,
  onRemoveItem
}) => {
  return (
    <div className="space-y-3">
      {currentOrder.map(item => (
        <div key={item.menuItem.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg shadow-premium-xs gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">{item.menuItem.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base truncate">{item.menuItem.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">₵{item.menuItem.price} each</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="w-6 sm:w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveItem(item.menuItem.id)}
              className="h-8 w-8 p-0 ml-1"
            >
              <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsList;
