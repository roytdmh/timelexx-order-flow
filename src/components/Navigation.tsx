
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, Clock, BarChart3, FileText, Package } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  allowedTabs?: string[];
  orderCount?: number;
  riderOrderCount?: number;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, allowedTabs, orderCount = 0, riderOrderCount = 0 }) => {
  const allTabs = [
    { id: 'menu', label: 'Menu & Orders', icon: Menu },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'tracker', label: 'Order Tracker', icon: Clock },
    { id: 'riders', label: 'Riders', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];
  const filteredTabs = allowedTabs ? allTabs.filter(t => allowedTabs.includes(t.id)) : allTabs;

  return (
    <nav className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
      {filteredTabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          variant={activeTab === tab.id ? 'default' : 'outline'}
          size="sm"
          className={`whitespace-nowrap text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] relative ${
            activeTab === tab.id
              ? 'bg-timelexx-red hover:bg-timelexx-red/90'
              : 'border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark'
          }`}
        >
          <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">{tab.label}</span>
          {tab.id === 'tracker' && orderCount > 0 && (
            <Badge variant="destructive" className="ml-1 sm:ml-2 bg-red-500 text-[10px] sm:text-xs px-1 sm:px-2">
              {orderCount}
            </Badge>
          )}
          {tab.id === 'riders' && riderOrderCount > 0 && (
            <Badge variant="destructive" className="ml-1 sm:ml-2 bg-red-500 text-[10px] sm:text-xs px-1 sm:px-2">
              {riderOrderCount}
            </Badge>
          )}
        </Button>
      ))}
    </nav>
  );
};

export default Navigation;
