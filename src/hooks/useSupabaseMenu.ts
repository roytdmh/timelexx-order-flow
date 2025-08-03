import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useSupabaseMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const transformedItems: MenuItem[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        icon: item.icon,
        category: item.category as 'Mains' | 'Drinks' | 'Sides',
        description: item.description || undefined
      })) || [];

      setMenuItems(transformedItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    refreshMenu: fetchMenuItems
  };
};