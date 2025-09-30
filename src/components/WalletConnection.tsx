'use client';

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from './ui/Modal';
import { 
  Wallet, 
  User, 
  LogOut, 
  Copy, 
  ExternalLink, 
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatAddress } from '@/utils/format';
import { cn } from '@/utils/helpers';

export interface WalletConnectionProps {
  className?: string;
  variant?: 'default' | 'compact' | 'full';
  showBalance?: boolean;
  showNetwork?: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  className,
  variant = 'default',
  showBalance = false,
  showNetwork = true,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { disconnect } = useDisconnect();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validate required props
  if (!address && isConnected) {
    console.warn('WalletConnection: Connected but no address available');
  }

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowAccountModal(false);
  };

  const openEtherscan = () => {
    if (address && chain) {
      const baseUrl = chain.id === 1 
        ? 'https://etherscan.io'
        : chain.id === 5
        ? 'https://goerli.etherscan.io'
        : 'https://etherscan.io';
      window.open(`${baseUrl}/address/${address}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <div className={cn('flex items-center', className)}>
        <ConnectButton.Custom>
          {({ openConnectModal }) => {
            return (
              <Button
                onClick={openConnectModal}
                variant="default"
                size={variant === 'compact' ? 'sm' : 'default'}
                className="flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </Button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAccountModal(true)}
          className="flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>{ensName || formatAddress(address!)}</span>
        </Button>
        
        <AccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          address={address!}
          ensName={ensName}
          chain={chain}
          onCopyAddress={handleCopyAddress}
          onDisconnect={handleDisconnect}
          onOpenEtherscan={openEtherscan}
          copied={copied}
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">
                {ensName || formatAddress(address!)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Connected</span>
                {showNetwork && chain && (
                  <Badge variant="secondary" size="sm">
                    {chain.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyAddress}
              className="h-8 w-8"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={openEtherscan}
              className="h-8 w-8"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Your data is encrypted with FHE technology</span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <ConnectButton.Custom>
        {({ openAccountModal }) => {
          return (
            <Button
              variant="outline"
              onClick={() => setShowAccountModal(true)}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{ensName || (address ? formatAddress(address) : 'Unknown')}</span>
              {showNetwork && chain && (
                <Badge variant="secondary" size="sm">
                  {chain.name}
                </Badge>
              )}
            </Button>
          );
        }}
      </ConnectButton.Custom>

      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        address={address || ''}
        ensName={ensName}
        chain={chain}
        onCopyAddress={handleCopyAddress}
        onDisconnect={handleDisconnect}
        onOpenEtherscan={openEtherscan}
        copied={copied}
      />
    </div>
  );
};

export default WalletConnection;

// Account Modal Component
interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  ensName?: string | null;
  chain?: any;
  onCopyAddress: () => void;
  onDisconnect: () => void;
  onOpenEtherscan: () => void;
  copied: boolean;
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  address,
  ensName,
  chain,
  onCopyAddress,
  onDisconnect,
  onOpenEtherscan,
  copied,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Account</ModalTitle>
          <ModalDescription>
            Manage your wallet connection and view account details
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-4">
          {/* Account Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">
                {ensName || 'Ethereum Account'}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatAddress(address)}
              </div>
            </div>
          </div>
          
          {/* Network Info */}
          {chain && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">Connected to {chain.name}</span>
              </div>
              <Badge variant="secondary" size="sm">
                Chain ID: {chain.id}
              </Badge>
            </div>
          )}
          
          {/* Security Notice */}
          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900">FHE Protection Active</div>
              <div className="text-blue-700">
                Your salary data is encrypted using Fully Homomorphic Encryption
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyAddress}
              className="flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Address</span>
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenEtherscan}
              className="flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Explorer</span>
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onDisconnect}
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect Wallet</span>
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

// Connection Status Component
export const ConnectionStatus: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, address, chain } = useAccount();
  
  if (!isConnected) {
    return (
      <div className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}>
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <span>Wallet not connected</span>
      </div>
    );
  }
  
  return (
    <div className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}>
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span>Connected to {chain?.name || 'Ethereum'}</span>
    </div>
  );
};