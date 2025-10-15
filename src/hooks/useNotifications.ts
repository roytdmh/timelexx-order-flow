import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types';
import { toast } from '@/hooks/use-toast';
import { showPushNotification, checkNotificationPermission } from '@/utils/pushNotifications';
import { playNotificationSound } from '@/utils/notificationSound';

export const useNotifications = (userId: string | undefined, userRole: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch existing notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const mappedNotifications: Notification[] = data.map(n => ({
          id: n.id,
          userId: n.user_id,
          orderId: n.order_id || '',
          type: n.type as Notification['type'],
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: new Date(n.created_at)
        }));
        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.filter(n => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications with unique channel ID per user session
    const channelId = `notifications-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            orderId: payload.new.order_id || '',
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            read: payload.new.read,
            createdAt: new Date(payload.new.created_at)
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Play sound
          playNotificationSound();
          
          // Show in-app toast
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });

          // Show push notification if permission granted
          const permission = checkNotificationPermission();
          if (permission === 'granted') {
            showPushNotification(newNotification.title, {
              body: newNotification.message,
              tag: `notification-${newNotification.id}`,
              data: {
                url: '/',
                notificationId: newNotification.id,
                orderId: newNotification.orderId
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
