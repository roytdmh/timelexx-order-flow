
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Clock, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { profile } = useAuth();

  const getTabsForRole = () => {
    const allTabs = [
      { id: 'menu', label: 'Menu & Orders', icon: Menu, roles: ['timelexx_kitchen', 'customer_hub'] },
      { id: 'tracker', label: 'Order Tracker', icon: Clock, roles: ['timelexx_kitchen', 'timelexx_riders'] },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['timelexx_kitchen'] },
      { id: 'reports', label: 'Reports', icon: FileText, roles: ['timelexx_kitchen'] },
    ];

    return allTabs.filter(tab => !profile?.role || tab.roles.includes(profile.role));
  };

  const tabs = getTabsForRole();

  return (
    <nav className="bg-white border-b-2 border-timelexx-yellow p-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => onTabChange(tab.id)}
                className={
                  activeTab === tab.id 
                    ? "bg-timelexx-red hover:bg-timelexx-red/90 text-white" 
                    : "border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark"
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
