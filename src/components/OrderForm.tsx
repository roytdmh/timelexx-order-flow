import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash, Plus, Clock } from 'lucide-react';
import { MenuItem, OrderItem } from '@/types';
import LocationPicker from './LocationPicker';

interface OrderFormProps {
  currentOrder: OrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSubmitOrder: (
    orderType: 'pickup' | 'delivery', 
    riderNumber?: string, 
    customerName?: string,
    customerNumber?: string,
    customerLocation?: { address: string; coordinates: [number, number] }
  ) => void;
  onClearOrder: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  currentOrder,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearOrder
}) => {
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [riderNumber, setRiderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerLocationText, setCustomerLocationText] = useState('');

  const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleSubmit = () => {
    if (currentOrder.length === 0) return;
    
    // Convert text location to the expected format
    const customerLocation = customerLocationText.trim() 
      ? { address: customerLocationText.trim(), coordinates: [0, 0] as [number, number] }
      : undefined;
    
    onSubmitOrder(
      orderType, 
      orderType === 'delivery' ? riderNumber : undefined,
      customerName || undefined,
      customerNumber || undefined,
      customerLocation
    );
    
    // Reset form
    setOrderType('pickup');
    setRiderNumber('');
    setCustomerName('');
    setCustomerNumber('');
    setCustomerLocationText('');
  };

  const riders = ['Rider 001', 'Rider 002', 'Rider 003', 'Rider 004', 'Rider 005'];

  return (
    <Card className="border-2 border-timelexx-yellow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-timelexx-dark">
          <Clock className="w-5 h-5" />
          Current Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentOrder.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No items in current order. Add items from the menu above.
          </p>
        ) : (
          <>
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

            <div className="border-t pt-4 space-y-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-timelexx-red">
                  Total: ₵{total}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Customer Name (Optional)</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-3">
                <Label>Customer Number (Optional)</Label>
                <Input
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="Enter customer phone number"
                  type="tel"
                />
              </div>

              <div className="space-y-3">
                <Label>Customer Location (Optional)</Label>
                <Input
                  value={customerLocationText}
                  onChange={(e) => setCustomerLocationText(e.target.value)}
                  placeholder="Enter customer address or location"
                />
              </div>

              <div className="space-y-3">
                <Label>Order Type</Label>
                <RadioGroup value={orderType} onValueChange={(value: 'pickup' | 'delivery') => setOrderType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup">Pickup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery">Delivery</Label>
                  </div>
                </RadioGroup>
              </div>

              {orderType === 'delivery' && (
                <div className="space-y-2">
                  <Label>Select Rider</Label>
                  <Select value={riderNumber} onValueChange={setRiderNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {riders.map(rider => (
                        <SelectItem key={rider} value={rider}>
                          {rider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-timelexx-red hover:bg-timelexx-red/90"
                  disabled={orderType === 'delivery' && !riderNumber}
                >
                  Place Order
                </Button>
                <Button
                  onClick={onClearOrder}
                  variant="outline"
                  className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
                >
                  Clear
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderForm;
