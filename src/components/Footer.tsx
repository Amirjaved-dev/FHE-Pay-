'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Github, Twitter, Globe, Heart } from 'lucide-react';
import { cn } from '@/utils/helpers';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'Security', href: '/#security' },
      { name: 'Pricing', href: '/#pricing' },
      { name: 'FAQ', href: '/#faq' },
    ],
    developers: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Smart Contracts', href: '/contracts' },
      { name: 'GitHub', href: 'https://github.com/fhe-pay' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/fhe-pay',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/fhepay',
      icon: Twitter,
    },
    {
      name: 'Website',
      href: 'https://fhepay.com',
      icon: Globe,
    },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">FHE-Pay</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Secure, private payroll streaming powered by Fully Homomorphic Encryption. 
                Revolutionizing how businesses handle salary payments with zero-knowledge privacy.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developers Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Developers</h3>
              <ul className="space-y-3">
                {footerLinks.developers.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© {currentYear} FHE-Pay. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>using</span>
              <Link 
                href="https://zama.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Zama FHE
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="py-4 border-t border-border">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>
              This application uses Fully Homomorphic Encryption to ensure your salary data remains private and secure.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;