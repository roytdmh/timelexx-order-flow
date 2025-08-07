
import React, { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import MenuDisplay from '@/components/MenuDisplay';
import OrderForm from '@/components/OrderForm';
import OrderTracker from '@/components/OrderTracker';
import Analytics from '@/components/Analytics';
import Reports from '@/components/Reports';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import { MenuItem, OrderItem } from '@/types';
import { downloadReportAsPDF } from '@/utils/reportGenerator';

const Index = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  
  const { 
    orders, 
    addOrder, 
    updateOrderStatus, 
    resetAllOrders,
    getTodaysOrders, 
    getDailySummary 
  } = useSupabaseOrders();

  const handleAddToOrder = (menuItem: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCurrentOrder(prev =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const handleSubmitOrder = (
    orderType: 'pickup' | 'delivery', 
    riderNumber?: string, 
    customerName?: string,
    customerNumber?: string,
    customerLocation?: { address: string; coordinates: [number, number] }
  ) => {
    const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    
    addOrder({
      items: [...currentOrder],
      total,
      orderType,
      riderNumber,
      customerName,
      customerNumber,
      customerLocation,
      status: 'pending'
    });

    setCurrentOrder([]);
    setActiveTab('tracker'); // Switch to tracker after placing order
  };

  const handleClearOrder = () => {
    setCurrentOrder([]);
  };

  const handleDownloadReport = async (): Promise<void> => {
    const summary = getDailySummary();
    const todaysOrders = getTodaysOrders();
    downloadReportAsPDF(summary, todaysOrders);
  };

  const summary = getDailySummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto p-4 sm:p-6">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 xl:col-span-2">
              <MenuDisplay onAddToOrder={handleAddToOrder} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1">
              <OrderForm
                currentOrder={currentOrder}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onSubmitOrder={handleSubmitOrder}
                onClearOrder={handleClearOrder}
              />
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <OrderTracker
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onResetOrders={resetAllOrders}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics summary={summary} />
        )}

        {activeTab === 'reports' && (
          <Reports
            summary={summary}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
