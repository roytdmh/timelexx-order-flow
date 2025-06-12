
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { menuItems } from '@/data/menu';

interface MenuDisplayProps {
  onAddToOrder: (item: MenuItem) => void;
}

const MenuDisplay: React.FC<MenuDisplayProps> = ({ onAddToOrder }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-timelexx-dark">Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map(item => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200 border-2 hover:border-timelexx-yellow">
            <CardHeader className="text-center pb-3">
              <div className="text-4xl mb-2">{item.icon}</div>
              <CardTitle className="text-lg text-timelexx-dark">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-2xl font-bold text-timelexx-red">
                ₵{item.price}
              </p>
              <Button 
                onClick={() => onAddToOrder(item)}
                className="w-full bg-timelexx-red hover:bg-timelexx-red/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuDisplay;
