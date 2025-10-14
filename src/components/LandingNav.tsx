import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Mail, Phone, ChevronDown, UtensilsCrossed, Briefcase, Info, Menu, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LandingNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentPath = location.pathname;
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info('App is already installed or not available for installation');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-timelexx-yellow shadow-premium-sm">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          {/* Top Row: Home button and Install App button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-timelexx-yellow/20"
            >
              <Home className="h-5 w-5 text-timelexx-red" />
            </Button>
            
            {isInstallable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstallClick}
                className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Install App</span>
              </Button>
            )}
          </div>

          {/* Center Section - Dropdowns */}
          <div className="flex gap-2 w-full sm:w-auto justify-center items-center">
            {/* Order Your Food Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Order Your Food</span>
                  <span className="sm:hidden">Order</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-timelexx-yellow shadow-premium-lg z-[100]">
                <DropdownMenuItem 
                  onClick={() => navigate('/customer-auth')}
                  className="cursor-pointer hover:bg-timelexx-yellow/20 focus:bg-timelexx-yellow/20"
                >
                  Customer Log in
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Work With Timelexx Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm border-timelexx-yellow hover:bg-timelexx-yellow hover:text-timelexx-dark"
                >
                  <Briefcase className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Work With Timelexx</span>
                  <span className="sm:hidden">Work</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-timelexx-yellow shadow-premium-lg z-[100]">
                <DropdownMenuItem 
                  onClick={() => navigate('/admin-auth')}
                  className="cursor-pointer hover:bg-timelexx-yellow/20 focus:bg-timelexx-yellow/20"
                >
                  Kitchen
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/rider-auth')}
                  className="cursor-pointer hover:bg-timelexx-yellow/20 focus:bg-timelexx-yellow/20"
                >
                  Riders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section - Info and Contact */}
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/?tab=info')}
              className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
            >
              <Info className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Info</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContactDialog(true)}
              className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white"
            >
              <Mail className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Contact Us</span>
            </Button>
          </div>
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
