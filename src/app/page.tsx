'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Shield, Clock, Eye, Zap, Users, Lock } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      router.push('/dashboard');
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Fully Homomorphic Encryption',
      description: 'Salary amounts are encrypted end-to-end using FHE, ensuring complete privacy even from the platform.'
    },
    {
      icon: Clock,
      title: 'Real-time Streaming',
      description: 'Employees earn salary continuously and can withdraw their earned amount at any time.'
    },
    {
      icon: Eye,
      title: 'Private by Design',
      description: 'Only you can see your actual salary amounts. Employers and the platform see only encrypted data.'
    },
    {
      icon: Zap,
      title: 'Instant Withdrawals',
      description: 'Access your earned salary instantly without waiting for traditional payroll cycles.'
    },
    {
      icon: Users,
      title: 'Multi-party Support',
      description: 'Employers can manage multiple salary streams with different employees seamlessly.'
    },
    {
      icon: Lock,
      title: 'Blockchain Security',
      description: 'Built on Ethereum with smart contracts ensuring trustless and secure operations.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">FHE-Pay</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Private Payroll
              <span className="block text-blue-600">Powered by FHE</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The first fully private payroll streaming platform using Fully Homomorphic Encryption. 
              Stream salaries in real-time while keeping amounts completely confidential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isConnected ? (
                <button
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <div className="bg-gray-100 px-8 py-4 rounded-lg">
                  <p className="text-gray-600 mb-2">Connect your wallet to get started</p>
                  <ConnectButton />
                </div>
              )}
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FHE-Pay?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of payroll with complete privacy and real-time streaming.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Simple steps to start streaming private payroll
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-blue-100">Connect your Web3 wallet to get started with FHE-Pay</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Stream</h3>
              <p className="text-blue-100">Employers create encrypted salary streams for employees</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Earn &amp; Withdraw</h3>
              <p className="text-blue-100">Employees earn continuously and withdraw anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Experience Private Payroll?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the future of payroll streaming with complete privacy and security.
          </p>
          {!isConnected && (
            <div className="inline-block">
              <ConnectButton />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">FHE-Pay</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 FHE-Pay. Powered by Fully Homomorphic Encryption.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
