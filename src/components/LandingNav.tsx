import { Button } from '@/components/ui/button';
import { Home, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const LandingNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;

  const handleContactUs = () => {
    window.location.href = 'mailto:timelexxinn@gmail.com';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-timelexx-yellow shadow-premium-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Home Button - Left (hidden when authenticated) */}
          {!isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-timelexx-yellow/20"
            >
              <Home className="h-5 w-5 text-timelexx-red" />
            </Button>
          )}
          {isAuthenticated && <div className="w-10" />}

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

          {/* Contact Us Button - Right (hidden when authenticated) */}
          {!isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleContactUs}
              className="hover:bg-timelexx-yellow/20"
              title="Contact Us"
            >
              <Mail className="h-5 w-5 text-timelexx-red" />
            </Button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
    </nav>
  );
};
