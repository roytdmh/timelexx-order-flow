
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
  const tabs = allowedTabs ? allTabs.filter(t => allowedTabs.includes(t.id)) : allTabs;

  return (
    <nav className="bg-white border-b-2 border-timelexx-yellow p-3 sm:p-4 shadow-premium-sm">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const showBadge = (tab.id === 'tracker' && orderCount > 0) || (tab.id === 'riders' && riderOrderCount > 0);
            const badgeCount = tab.id === 'tracker' ? orderCount : riderOrderCount;
            
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => onTabChange(tab.id)}
                size="sm"
                className={`
                  relative min-h-[44px] px-2 sm:px-4 touch-manipulation
                  ${activeTab === tab.id 
                    ? "bg-timelexx-red hover:bg-timelexx-red/90 text-white text-xs sm:text-sm" 
                    : "border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark text-xs sm:text-sm"
                  }
                `}
              >
                <Icon className="w-4 h-4 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                <span className="sm:hidden text-[10px] leading-tight">{tab.label.split(' ')[0]}</span>
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
