import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { OrderItem } from '@/types';
import { ShoppingCart, MapPin, Phone, User } from 'lucide-react';

interface CustomerOrderFormProps {
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

const CustomerOrderForm: React.FC<CustomerOrderFormProps> = ({
  currentOrder,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearOrder
}) => {
  const { profile } = useAuth();
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [customerNumber, setCustomerNumber] = useState(profile?.phone_number || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleSubmit = () => {
    const orderData = {
      orderType,
      customerName: customerName || profile?.full_name,
      customerNumber: customerNumber || profile?.phone_number,
      customerLocation: orderType === 'delivery' && deliveryAddress ? {
        address: deliveryAddress,
        coordinates: [0, 0] as [number, number] // Default coordinates
      } : undefined
    };

    onSubmitOrder(
      orderData.orderType,
      undefined, // riderNumber - will be assigned by kitchen staff
      orderData.customerName,
      orderData.customerNumber,
      orderData.customerLocation
    );
  };

  const isFormValid = () => {
    const hasItems = currentOrder.length > 0;
    const hasCustomerInfo = customerName && customerNumber;
    const hasDeliveryInfo = orderType === 'pickup' || (orderType === 'delivery' && deliveryAddress);
    
    return hasItems && hasCustomerInfo && hasDeliveryInfo;
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentOrder.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No items in your order</p>
        ) : (
          <>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentOrder.map((item) => (
                <div key={item.menuItem.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.menuItem.name}</p>
                    <p className="text-xs text-gray-600">GH₵{item.menuItem.price} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (item.quantity > 1) {
                          onUpdateQuantity(item.menuItem.id, item.quantity - 1);
                        } else {
                          onRemoveItem(item.menuItem.id);
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      -
                    </Button>
                    <span className="mx-2 text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Name
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="Your phone number"
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
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </Label>
                  <Textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-timelexx-red hover:bg-timelexx-red/90"
                disabled={!isFormValid()}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOrderForm;