'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { cn } from '@/utils/helpers';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ThemeToggle } from './ui/ThemeToggle';
import { Menu, X, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Dashboard', href: '/dashboard', current: pathname.startsWith('/dashboard') },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FHE-Pay</span>
              <Badge variant="secondary" size="sm" className="ml-2">
                <Zap className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  item.current
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isConnected && (
              <div className="flex items-center space-x-2">
                <Badge variant="success" size="sm">
                  Connected
                </Badge>
              </div>
            )}
            <ConnectButton
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                    item.current
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Wallet Connection */}
              <div className="px-3 py-2 space-y-3">
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">Theme</span>
                </div>
                {isConnected && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="success" size="sm">
                      Connected
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                )}
                <div className="w-full">
                  <ConnectButton
                    chainStatus="icon"
                    accountStatus="address"
                    showBalance={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;