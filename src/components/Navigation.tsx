
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Clock, BarChart3, FileText } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'menu', label: 'Menu & Orders', icon: Menu },
    { id: 'tracker', label: 'Order Tracker', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <nav className="bg-white border-b-2 border-timelexx-yellow p-4 shadow-premium-sm">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => onTabChange(tab.id)}
                size="sm"
                className={
                  activeTab === tab.id 
                    ? "bg-timelexx-red hover:bg-timelexx-red/90 text-white text-xs sm:text-sm" 
                    : "border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark text-xs sm:text-sm"
                }
              >
                <Icon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
