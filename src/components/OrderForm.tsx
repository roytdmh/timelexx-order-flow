
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderItem } from '@/types';
import OrderFormHeader from './OrderForm/OrderFormHeader';
import OrderItemsList from './OrderForm/OrderItemsList';
import CustomerDetailsForm from './OrderForm/CustomerDetailsForm';
import OrderTypeSelector from './OrderForm/OrderTypeSelector';
import RiderSelector from './OrderForm/RiderSelector';
import OrderFormActions from './OrderForm/OrderFormActions';

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
  isCustomer?: boolean;
  isSubmitting?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  currentOrder,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearOrder,
  isCustomer = false,
  isSubmitting = false
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

  return (
    <Card className="border-2 border-timelexx-yellow shadow-premium-md">
      <OrderFormHeader />
      <CardContent className="space-y-4 p-4 sm:p-6">
        {currentOrder.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
            No items in current order. Add items from the menu above.
          </p>
        ) : (
          <>
            <OrderItemsList
              currentOrder={currentOrder}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />

            <div className="border-t pt-4 space-y-4">
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-timelexx-red">
                  Total: ₵{total}
                </p>
              </div>

              {!isCustomer && (
                <CustomerDetailsForm
                  customerName={customerName}
                  customerNumber={customerNumber}
                  customerLocationText={customerLocationText}
                  onCustomerNameChange={setCustomerName}
                  onCustomerNumberChange={setCustomerNumber}
                  onCustomerLocationChange={setCustomerLocationText}
                />
              )}

              <OrderTypeSelector
                orderType={orderType}
                onOrderTypeChange={setOrderType}
              />

              {orderType === 'delivery' && !isCustomer && (
                <RiderSelector
                  riderNumber={riderNumber}
                  onRiderChange={setRiderNumber}
                />
              )}

              <OrderFormActions
                onSubmit={handleSubmit}
                onClear={onClearOrder}
                isDelivery={orderType === 'delivery'}
                hasRider={isCustomer || !!riderNumber}
                isSubmitting={isSubmitting}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderForm;
