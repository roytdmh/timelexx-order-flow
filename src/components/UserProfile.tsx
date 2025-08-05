import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, ChefHat, Users, Bike } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserProfile = () => {
  const { user, profile, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'timelexx_kitchen':
        return { label: 'Kitchen Staff', icon: ChefHat, color: 'bg-red-100 text-red-800' };
      case 'customer_hub':
        return { label: 'Customer', icon: Users, color: 'bg-blue-100 text-blue-800' };
      case 'timelexx_riders':
        return { label: 'Rider', icon: Bike, color: 'bg-green-100 text-green-800' };
      default:
        return { label: 'User', icon: User, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!profile) return null;

  const roleInfo = getRoleInfo(profile.role);
  const RoleIcon = roleInfo.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-timelexx-yellow text-timelexx-dark">
              {profile.full_name?.charAt(0) || profile.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-timelexx-yellow text-timelexx-dark text-lg">
                {profile.full_name?.charAt(0) || profile.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.email}
              </p>
              <Badge className={`text-xs ${roleInfo.color}`}>
                <RoleIcon className="w-3 h-3 mr-1" />
                {roleInfo.label}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;