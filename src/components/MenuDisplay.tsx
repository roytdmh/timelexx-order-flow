
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { useSupabaseMenu } from '@/hooks/useSupabaseMenu';

interface MenuDisplayProps {
  onAddToOrder: (item: MenuItem) => void;
}

const MenuDisplay: React.FC<MenuDisplayProps> = ({ onAddToOrder }) => {
  const { menuItems, loading } = useSupabaseMenu();
  
  // Custom order for Mains category
  const mainsOrder = [
    "Jollof & Chicken",
    "Chicken Shawarma", 
    "Beef Shawarma",
    "Chicken & Beef Shawarma",
    "Loaded Fries"
  ];
  
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Apply custom ordering to Mains category
  if (menuByCategory['Mains']) {
    menuByCategory['Mains'] = menuByCategory['Mains'].sort((a, b) => {
      const indexA = mainsOrder.indexOf(a.name);
      const indexB = mainsOrder.indexOf(b.name);
      
      // If both items are in the custom order, sort by that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one item is in the custom order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in the custom order, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  const categoryOrder: ('Mains' | 'Sides' | 'Drinks')[] = ['Mains', 'Drinks'];

  return (
    <div className="space-y-8">
      {categoryOrder.map(category => menuByCategory[category] && (
        <div key={category}>
          <h2 className="text-xl sm:text-2xl font-bold text-timelexx-dark mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {menuByCategory[category].map(item => (
              <Card key={item.id} className="hover:shadow-premium-lg transition-all duration-200 border-2 hover:border-timelexx-yellow flex flex-col shadow-premium-sm">
                <CardHeader className="text-center pb-3 flex-grow p-3 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">{item.icon}</div>
                  <CardTitle className="text-sm sm:text-lg text-timelexx-dark min-h-[2.5rem] flex items-center justify-center">{item.name}</CardTitle>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground mt-1 min-h-[2rem] flex items-center justify-center">{item.description}</p>
                  ) : (
                    <div className="min-h-[2rem] mt-1"></div>
                  )}
                </CardHeader>
                <CardContent className="text-center space-y-3 mt-auto p-3 sm:p-6">
                  <p className="text-xl sm:text-2xl font-bold text-timelexx-red">
                    ₵{item.price}
                  </p>
                  <Button 
                    onClick={() => onAddToOrder(item)}
                    className="w-full bg-timelexx-red hover:bg-timelexx-red/90 text-white text-sm sm:text-base"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add to Order</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuDisplay;
