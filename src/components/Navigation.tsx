
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
    <nav className="glass-effect border-b border-white/30 p-6 shadow-lg backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => onTabChange(tab.id)}
                className={`
                  nav-item button-modern rounded-xl px-6 py-3 font-medium smooth-transition
                  ${activeTab === tab.id 
                    ? "bg-gradient-to-r from-timelexx-red to-timelexx-yellow text-white shadow-lg shadow-red-200 scale-105" 
                    : "bg-white/80 border-white/40 text-timelexx-dark hover:bg-white hover:shadow-md hover:scale-105 hover:border-timelexx-yellow/50"
                  }
                  ${activeTab === tab.id ? 'active' : ''}
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
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
