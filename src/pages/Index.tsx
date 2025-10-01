
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import MenuDisplay from '@/components/MenuDisplay';
import OrderForm from '@/components/OrderForm';
import OrderTracker from '@/components/OrderTracker';
import RidersTracker from '@/components/RidersTracker';
import Analytics from '@/components/Analytics';
import Reports from '@/components/Reports';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import { MenuItem, OrderItem } from '@/types';
import { downloadReportAsPDF } from '@/utils/reportGenerator';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  
  const { 
    orders, 
    addOrder, 
    updateOrderStatus, 
    resetAllOrders,
    getTodaysOrders, 
    getDailySummary 
  } = useSupabaseOrders();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
    const userName = user?.user_metadata?.full_name || user?.email || "Unknown User";
    downloadReportAsPDF(summary, todaysOrders, userName);
  };

  const summary = getDailySummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 xl:col-span-2 order-2 lg:order-1">
              <MenuDisplay onAddToOrder={handleAddToOrder} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1 order-1 lg:order-2">
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

        {activeTab === 'riders' && (
          <RidersTracker
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
