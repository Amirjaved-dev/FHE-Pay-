'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Shield, Key, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useFHEKeyRegistration } from '@/hooks/useContract';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';

export default function FHEKeyRegistration() {
  const { address, isConnected } = useAccount();
  const { registerFHEKey, isLoading, error } = useFHEKeyRegistration();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { fhePublicKey } = useAppStore();

  // Check if user has already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!address || !isConnected) return;

      setIsChecking(true);
      try {
        // Check if we already have a public key stored
        if (fhePublicKey) {
          setIsRegistered(true);
          return;
        }

        // TODO: Check contract for key registration status
        // For now, we'll just check local storage as a fallback
        const storedKey = localStorage.getItem(`fhe_public_key_${address}`);
        if (storedKey) {
          setIsRegistered(true);
        }
      } catch (err) {
        console.error('Failed to check FHE key registration:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkRegistration();
  }, [address, isConnected, fhePublicKey]);

  const handleRegisterKey = async () => {
    try {
      const tx = await registerFHEKey();
      if (tx) {
        await tx.wait();
        setIsRegistered(true);
      }
    } catch (err) {
      console.error('Failed to register FHE key:', err);
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  if (isChecking) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">Checking FHE key registration...</span>
        </div>
      </Card>
    );
  }

  if (isRegistered) {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">FHE Key Registered</h3>
            <p className="text-xs text-green-600">
              Your Fully Homomorphic Encryption key is registered and ready to use.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegistered(false)}
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <div className="space-y-3">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">FHE Key Required</h3>
            <p className="text-xs text-yellow-600 mb-3">
              You need to register a Fully Homomorphic Encryption key to create or receive salary streams.
              This ensures your salary information remains completely private.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
                <p className="text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleRegisterKey}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Register FHE Key
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-yellow-100 rounded-md p-2">
          <p className="text-xs text-yellow-700">
            <strong>Why this is needed:</strong> FHE allows calculations on encrypted data without decrypting it,
            ensuring your salary amounts remain private even from the platform.
          </p>
        </div>
      </div>
    </Card>
  );
}