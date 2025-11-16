import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell } from 'lucide-react';
import { Order } from '@/types';

interface AwaitingConfirmationAlertProps {
  orders: Order[];
}

const AwaitingConfirmationAlert = ({ orders }: AwaitingConfirmationAlertProps) => {
  const [showAlert, setShowAlert] = useState(false);
  
  // Filter orders awaiting confirmation for more than 30 minutes
  const urgentOrders = orders.filter(order => {
    if (order.status !== 'awaiting_confirmation') return false;
    
    const timeSinceReport = Date.now() - order.timestamp.getTime();
    const minutesPending = Math.floor(timeSinceReport / (1000 * 60));
    return minutesPending > 30;
  });

  useEffect(() => {
    if (urgentOrders.length > 0) {
      setShowAlert(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowAlert(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [urgentOrders.length]);

  if (urgentOrders.length === 0 || !showAlert) return null;

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <Bell className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        Urgent: Deliveries Awaiting Confirmation
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        {urgentOrders.length} delivery {urgentOrders.length === 1 ? 'has' : 'have'} been 
        waiting for confirmation for over 30 minutes. Please verify and confirm.
      </AlertDescription>
    </Alert>
  );
};

export default AwaitingConfirmationAlert;
