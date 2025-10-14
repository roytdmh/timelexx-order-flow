import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requestNotificationPermission, checkNotificationPermission } from '@/utils/pushNotifications';

interface NotificationPermissionPromptProps {
  userRole: string | null;
}

const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({ userRole }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const hasAskedBefore = localStorage.getItem('notification-prompt-shown') === 'true';
    const permission = checkNotificationPermission();
    
    // Show prompt if user is logged in, hasn't been asked, and permission is default
    if (!hasAskedBefore && permission === 'default' && userRole) {
      // Delay showing prompt by 2 seconds for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [userRole]);

  const handleEnable = async () => {
    const permission = await requestNotificationPermission();
    localStorage.setItem('notification-prompt-shown', 'true');
    setShowPrompt(false);
    
    if (permission === 'granted') {
      console.log('Notifications enabled successfully');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-shown', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Card className="w-80 shadow-xl border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Stay Updated!</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get instant notifications about your orders, even when the app is closed.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleEnable}
                  className="flex-1"
                >
                  Enable
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDismiss}
                >
                  Not Now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPermissionPrompt;
