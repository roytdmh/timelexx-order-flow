
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
        className={`shadow-lg ${showResetConfirm ? 'animate-pulse' : ''}`}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {showResetConfirm ? 'Confirm Reset?' : "Reset Today's Orders"}
      </Button>
    </div>
  );
};

export default ResetOrdersButton;
