import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import MenuDisplay from '@/components/MenuDisplay';
import OrderForm from '@/components/OrderForm';
import { CustomerOrders } from '@/pages/CustomerOrders';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import { useAuth } from '@/hooks/useAuth';
import { MenuItem, OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut, Phone, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, role, profile, loading: authLoading, signOut } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  const { orders, addOrder } = useSupabaseOrders();

  // Filter orders for current user
  const userOrders = orders.filter(order => order.customerUserId === user?.id);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    
    if (!authLoading && role && role !== 'customer') {
      navigate('/dashboard');
      return;
    }
  }, [user, role, authLoading, navigate]);

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

  const handleSubmitOrder = async (
    orderType: 'pickup' | 'delivery', 
    riderNumber?: string, 
    customerName?: string,
    customerNumber?: string,
    customerLocation?: { address: string; coordinates: [number, number] }
  ) => {
    const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    
    // Auto-fill customer details from profile
    const finalCustomerName = profile?.full_name || customerName;
    const finalCustomerNumber = profile?.phone_number || customerNumber;
    const finalCustomerLocation = { 
      address: profile?.location || '', 
      coordinates: [0, 0] as [number, number] 
    };

    // Random rider assignment for delivery orders
    let finalRiderNumber = riderNumber;
    let assignedRiderId: string | undefined = undefined;
    
    if (orderType === 'delivery') {
      const riders = ['Sabolia', 'Awaga', 'Joe Lee'];
      finalRiderNumber = riders[Math.floor(Math.random() * riders.length)];
      
      // Look up rider's UUID from profiles table
      const { data: riderProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('full_name', finalRiderNumber)
        .single();
      
      assignedRiderId = riderProfile?.user_id;
    }
    
    addOrder({
      items: [...currentOrder],
      total,
      orderType,
      riderNumber: finalRiderNumber,
      assignedRiderId,
      customerName: finalCustomerName,
      customerNumber: finalCustomerNumber,
      customerLocation: finalCustomerLocation,
      status: 'placed',
      customerUserId: user?.id,
    });

    setCurrentOrder([]);
  };

  const handleClearOrder = () => {
    setCurrentOrder([]);
  };

  // Show loading state
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

  // Wait for role to be determined
  if (!role) {
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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-timelexx-red">My Menu & Orders</h1>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              {profile?.full_name && (
                <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                  Hi, {profile.full_name}!
                </span>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowContactDialog(true)}
                className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white shrink-0"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white shrink-0"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl space-y-8">
        {/* Menu & Order Form Section */}
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
              isCustomer={true}
            />
          </div>
        </div>

        {/* Order History Section */}
        <div className="mt-8">
          <CustomerOrders orders={userOrders} />
        </div>
      </main>

      {/* Contact Us Dialog */}
      <AlertDialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-timelexx-red">Contact Us</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-base">
                <Phone className="h-5 w-5 text-timelexx-red" />
                <div>
                  <p className="font-semibold text-foreground">Customer Service</p>
                  <a 
                    href="tel:+233553695569" 
                    className="text-timelexx-red hover:underline"
                  >
                    +233 55 369 5569
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-base">
                <Mail className="h-5 w-5 text-timelexx-red" />
                <div>
                  <p className="font-semibold text-foreground">Follow us on TikTok</p>
                  <a 
                    href="https://www.tiktok.com/@timelexxinn" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-timelexx-red hover:underline"
                  >
                    TimelexxInn on TikTok
                  </a>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-timelexx-red text-white hover:bg-timelexx-red/90">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDashboard;
