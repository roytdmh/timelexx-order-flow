import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const RealtimeConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Create a test channel to monitor connection status
    const statusChannel = supabase.channel('connection-status-monitor');
    
    statusChannel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          setIsConnected(true);
          setShowIndicator(true);
          
          // Hide indicator after 3 seconds if connected
          setTimeout(() => setShowIndicator(false), 3000);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setShowIndicator(true);
          
          // Hide indicator after 3 seconds
          setTimeout(() => setShowIndicator(false), 3000);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setShowIndicator(true);
        }
      });

    // Check connection status periodically
    const interval = setInterval(() => {
      const channels = supabase.getChannels();
      const hasActiveChannels = channels.some(ch => ch.state === 'joined');
      setIsConnected(hasActiveChannels);
    }, 5000);

    return () => {
      supabase.removeChannel(statusChannel);
      clearInterval(interval);
    };
  }, []);

  // Always show when disconnected
  const shouldShow = !isConnected || showIndicator;

  if (!shouldShow) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
              isConnected 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">Disconnected</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>
            {isConnected 
              ? 'Real-time notifications active - you\'ll receive instant updates!' 
              : 'Real-time connection lost - reconnecting...'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
