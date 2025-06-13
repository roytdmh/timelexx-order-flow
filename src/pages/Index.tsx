
import React, { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import MenuDisplay from '@/components/MenuDisplay';
import OrderForm from '@/components/OrderForm';
import OrderTracker from '@/components/OrderTracker';
import Analytics from '@/components/Analytics';
import Reports from '@/components/Reports';
import { useOrders } from '@/hooks/useOrders';
import { MenuItem, OrderItem } from '@/types';
import { generateDailyReport, sendReportByEmail } from '@/utils/reportGenerator';

const Index = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  
  const { 
    orders, 
    addOrder, 
    updateOrderStatus, 
    getTodaysOrders, 
    getDailySummary 
  } = useOrders();

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

  const handleSubmitOrder = (orderType: 'pickup' | 'delivery', riderNumber?: string, customerName?: string) => {
    const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    
    addOrder({
      items: [...currentOrder],
      total,
      orderType,
      riderNumber,
      customerName,
      status: 'pending'
    });

    setCurrentOrder([]);
    setActiveTab('tracker'); // Switch to tracker after placing order
  };

  const handleClearOrder = () => {
    setCurrentOrder([]);
  };

  const handleSendReport = async (): Promise<void> => {
    const summary = getDailySummary();
    const todaysOrders = getTodaysOrders();
    const reportContent = generateDailyReport(summary, todaysOrders);
    
    const success = await sendReportByEmail(reportContent);
    if (!success) {
      throw new Error('Failed to send report');
    }
  };

  const summary = getDailySummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto p-6">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <MenuDisplay onAddToOrder={handleAddToOrder} />
            </div>
            <div>
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
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics summary={summary} />
        )}

        {activeTab === 'reports' && (
          <Reports
            summary={summary}
            onSendReport={handleSendReport}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
