import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Mail, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export const LandingNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;
  const [showContactDialog, setShowContactDialog] = useState(false);

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
            <Button
              variant={currentPath === '/' && location.search === '?tab=info' ? 'default' : 'outline'}
              onClick={() => navigate('/?tab=info')}
              className={
                currentPath === '/' && location.search === '?tab=info'
                  ? 'bg-timelexx-red hover:bg-timelexx-red/90'
                  : 'border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark'
              }
            >
              Info
            </Button>
          </div>

          {/* Contact Us Button - Right */}
          <Button
            variant="outline"
            onClick={() => setShowContactDialog(true)}
            className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>

      {/* Contact Us Dialog */}
      <AlertDialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-timelexx-red">Contact Us</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-base">
                <Phone className="h-5 w-5 text-timelexx-red" />
                <div>
                  <p className="font-semibold text-foreground">Customer Service</p>
                  <a 
                    href="tel:+233553695569" 
                    className="text-timelexx-red hover:underline"
                  >
                    +233 55 369 5569
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-base">
                <Mail className="h-5 w-5 text-timelexx-red" />
                <div>
                  <p className="font-semibold text-foreground">Follow us on TikTok</p>
                  <a 
                    href="https://www.tiktok.com/@timelexxinn" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-timelexx-red hover:underline"
                  >
                    TimelexxInn on TikTok
                  </a>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-timelexx-red text-white hover:bg-timelexx-red/90">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};
