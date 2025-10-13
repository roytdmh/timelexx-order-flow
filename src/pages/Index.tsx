
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
import CustomerOrderTracker from '@/components/CustomerOrderTracker';
import { CustomerOrders } from '@/pages/CustomerOrders';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import { useAuth } from '@/hooks/useAuth';
import { MenuItem, OrderItem } from '@/types';
import { downloadReportAsPDF } from '@/utils/reportGenerator';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();
  const { user, role, profile, loading: authLoading, signOut } = useAuth();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Filter orders based on role
  const filteredOrders = role === 'customer' 
    ? orders.filter(order => order.customerUserId === user?.id)
    : role === 'rider'
    ? orders.filter(order => order.orderType === 'delivery' && order.riderNumber === profile?.full_name)
    : orders;

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
    
    // Auto-fill customer details for customer role
    const finalCustomerName = role === 'customer' ? profile?.full_name || customerName : customerName;
    const finalCustomerNumber = role === 'customer' ? profile?.phone_number || customerNumber : customerNumber;
    const finalCustomerLocation = role === 'customer' 
      ? { address: profile?.location || '', coordinates: [0, 0] as [number, number] }
      : customerLocation;

    // Random rider assignment for customers ordering delivery
    let finalRiderNumber = riderNumber;
    if (role === 'customer' && orderType === 'delivery') {
      const riders = ['Sabolia', 'Awaga', 'Joe Lee'];
      finalRiderNumber = riders[Math.floor(Math.random() * riders.length)];
    }
    
    addOrder({
      items: [...currentOrder],
      total,
      orderType,
      riderNumber: finalRiderNumber,
      customerName: finalCustomerName,
      customerNumber: finalCustomerNumber,
      customerLocation: finalCustomerLocation,
      status: 'pending',
      customerUserId: role === 'customer' ? user?.id : undefined,
    });

    setCurrentOrder([]);
    if (role === 'customer') {
      setActiveTab('orders'); // Switch to orders tab to see the order status
    } else {
      setActiveTab('tracker'); // Switch to tracker after placing order (admin only)
    }
  };

  const handleClearOrder = () => {
    setCurrentOrder([]);
  };

  const handleDownloadReport = async (): Promise<void> => {
    const summary = getDailySummary();
    const todaysOrders = getTodaysOrders();
    downloadReportAsPDF(summary, todaysOrders);
  };

  // Set initial tab based on role - MUST be before any early returns
  useEffect(() => {
    if (role === 'rider') {
      setActiveTab('riders');
    } else if (role === 'customer') {
      setActiveTab('menu');
    }
  }, [role]);

  const summary = getDailySummary();

  // Define available tabs based on role
  const getAvailableTabs = () => {
    if (role === 'customer') {
      return ['menu', 'orders'];
    } else if (role === 'rider') {
      return ['riders'];
    } else {
      return ['menu', 'tracker', 'riders', 'analytics', 'reports'];
    }
  };

  const availableTabs = getAvailableTabs();

  // Show loading state - AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="border-b-2 border-timelexx-yellow bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {role !== 'rider' && (
              <Navigation 
                activeTab={activeTab} 
                onTabChange={(tab) => availableTabs.includes(tab) && setActiveTab(tab)} 
                allowedTabs={availableTabs}
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            {role === 'customer' && profile?.full_name && (
              <span className="text-sm font-medium">Hi, {profile.full_name}!</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
        {availableTabs.includes('menu') && activeTab === 'menu' && (
          <>
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
                  isCustomer={role === 'customer'}
                />
              </div>
            </div>
            {role === 'customer' && (
              <CustomerOrderTracker orders={filteredOrders} />
            )}
          </>
        )}

        {availableTabs.includes('orders') && activeTab === 'orders' && (
          <CustomerOrders />
        )}

        {availableTabs.includes('tracker') && activeTab === 'tracker' && (
          <OrderTracker
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
            onResetOrders={resetAllOrders}
          />
        )}

        {availableTabs.includes('riders') && activeTab === 'riders' && (
          <RidersTracker
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
            onResetOrders={resetAllOrders}
          />
        )}

        {availableTabs.includes('analytics') && activeTab === 'analytics' && (
          <Analytics summary={summary} />
        )}

        {availableTabs.includes('reports') && activeTab === 'reports' && (
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
