
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
        <div key={item.menuItem.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.menuItem.icon}</span>
            <div>
              <p className="font-medium">{item.menuItem.name}</p>
              <p className="text-sm text-muted-foreground">₵{item.menuItem.price} each</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
            >
              -
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveItem(item.menuItem.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsList;
