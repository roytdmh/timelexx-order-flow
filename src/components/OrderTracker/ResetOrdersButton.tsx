
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ResetOrdersButtonProps {
  onResetOrders: () => void;
}

const ResetOrdersButton: React.FC<ResetOrdersButtonProps> = ({ onResetOrders }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetOrders = () => {
    if (showResetConfirm) {
      onResetOrders();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleResetOrders}
        variant={showResetConfirm ? "destructive" : "outline"}
        size="lg"
        className={`
          button-modern shadow-2xl backdrop-blur-sm border-0 font-medium px-6 py-4 rounded-2xl smooth-transition
          ${showResetConfirm 
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-200' 
            : 'glass-effect text-gray-700 hover:shadow-xl hover:scale-105'
          }
        `}
      >
        <Trash2 className="w-5 h-5 mr-2" />
        {showResetConfirm ? 'Confirm Reset?' : 'Reset All Orders'}
      </Button>
    </div>
  );
};

export default ResetOrdersButton;
