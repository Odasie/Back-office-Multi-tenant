import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalSearch from '@/components/GlobalSearch';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Sales', path: '/dashboard/sales' },
    { name: 'Operations', path: '/dashboard/operations' },
    { name: 'Customer Service', path: '/dashboard/customer-service' },
    { name: 'Finance', path: '/finance' },
    { name: 'Insights', path: '/insights' },
  ];

  const NavigationContent = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-4'}`}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          onClick={() => {
            navigate(item.path);
            if (mobile) setMobileMenuOpen(false);
          }}
          className={mobile ? 'justify-start' : ''}
          aria-label={`Navigate to ${item.name}`}
        >
          {item.name}
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <h1 
                className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate('/')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
                aria-label="Navigate to home"
              >
                Odasie CRM
              </h1>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <NavigationContent />
              </div>
            </div>

            {/* Search and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Open mobile menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64">
                    <div className="flex flex-col space-y-6 pt-6">
                      <div className="sm:hidden">
                        <GlobalSearch />
                      </div>
                      <NavigationContent mobile />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    aria-label="User menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-50" align="end">
                  <DropdownMenuLabel>
                    {user?.user_metadata?.first_name || user?.email || 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;