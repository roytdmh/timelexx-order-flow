import { Button } from '@/components/ui/button';
import { Home, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LandingNavProps {
  showContactUs?: boolean;
}

export const LandingNav = ({ showContactUs = false }: LandingNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleContactUs = () => {
    window.location.href = 'mailto:timelexxinn@gmail.com';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-timelexx-yellow shadow-premium-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Home Button - Left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-timelexx-yellow/20"
          >
            <Home className="h-5 w-5 text-timelexx-red" />
          </Button>

          {/* Center Tabs */}
          <div className="flex gap-2">
            <Button
              variant={currentPath === '/customer-auth' ? 'default' : 'outline'}
              onClick={() => navigate('/customer-auth')}
              className={
                currentPath === '/customer-auth'
                  ? 'bg-timelexx-red hover:bg-timelexx-red/90'
                  : 'border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark'
              }
            >
              Customer
            </Button>
            <Button
              variant={currentPath === '/admin-auth' ? 'default' : 'outline'}
              onClick={() => navigate('/admin-auth')}
              className={
                currentPath === '/admin-auth'
                  ? 'bg-timelexx-red hover:bg-timelexx-red/90'
                  : 'border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark'
              }
            >
              Admin
            </Button>
            <Button
              variant={currentPath === '/rider-auth' ? 'default' : 'outline'}
              onClick={() => navigate('/rider-auth')}
              className={
                currentPath === '/rider-auth'
                  ? 'bg-timelexx-red hover:bg-timelexx-red/90'
                  : 'border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark'
              }
            >
              Rider
            </Button>
          </div>

          {/* Contact Us Button - Right */}
          {showContactUs ? (
            <Button
              variant="outline"
              onClick={handleContactUs}
              className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          ) : (
            <div className="w-[120px]" /> // Spacer for layout balance
          )}
        </div>
      </div>
    </nav>
  );
};
