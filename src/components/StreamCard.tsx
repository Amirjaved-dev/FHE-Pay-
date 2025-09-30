'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Badge, StatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Building, 
  Play, 
  Pause, 
  Eye,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { formatEth, formatCurrency, formatDuration, formatDate, formatAddress } from '@/utils/format';
import { cn } from '@/utils/helpers';

export interface StreamData {
  id: string;
  employeeName: string;
  employeeAddress: string;
  employerName?: string;
  employerAddress?: string;
  salaryAmount: string; // ETH amount as string
  duration: number; // in seconds
  startTime: number; // timestamp
  endTime: number; // timestamp
  status: 'active' | 'paused' | 'completed' | 'pending';
  earnedAmount: string; // ETH amount as string
  withdrawnAmount: string; // ETH amount as string
  lastWithdrawal?: number; // timestamp
  createdAt: number; // timestamp
}

export interface StreamCardProps {
  stream: StreamData;
  viewType: 'employer' | 'employee';
  onToggleStatus?: (streamId: string) => void;
  onWithdraw?: (streamId: string) => void;
  onViewDetails?: (streamId: string) => void;
  className?: string;
  showActions?: boolean;
}

const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  viewType,
  onToggleStatus,
  onWithdraw,
  onViewDetails,
  className,
  showActions = true,
}) => {
  const now = Math.floor(Date.now() / 1000);
  const progress = Math.min(
    Math.max(((now - stream.startTime) / (stream.endTime - stream.startTime)) * 100, 0),
    100
  );
  
  const isActive = stream.status === 'active';
  const isCompleted = stream.status === 'completed' || now >= stream.endTime;
  const canWithdraw = viewType === 'employee' && parseFloat(stream.earnedAmount) > parseFloat(stream.withdrawnAmount);
  const canToggle = viewType === 'employer' && !isCompleted;

  const timeRemaining = Math.max(0, stream.endTime - now);
  const availableAmount = (parseFloat(stream.earnedAmount) - parseFloat(stream.withdrawnAmount)).toString();

  const handleToggleStatus = () => {
    if (onToggleStatus && canToggle) {
      onToggleStatus(stream.id);
    }
  };

  const handleWithdraw = () => {
    if (onWithdraw && canWithdraw) {
      onWithdraw(stream.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(stream.id);
    }
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {viewType === 'employer' ? (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{stream.employeeName}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>{stream.employerName || 'Employer'}</span>
                </div>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                {viewType === 'employer' 
                  ? formatAddress(stream.employeeAddress)
                  : formatAddress(stream.employerAddress || '')
                }
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={stream.status} size="sm" />
            {showActions && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleViewDetails}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Salary Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span>Total Salary</span>
            </div>
            <div className="font-semibold">
              {formatEth(stream.salaryAmount)} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(parseFloat(stream.salaryAmount) * 2000)} {/* Mock ETH price */}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Download className="w-3 h-3" />
              <span>Available</span>
            </div>
            <div className="font-semibold text-green-600">
              {formatEth(availableAmount)} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(parseFloat(availableAmount) * 2000)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            variant={isCompleted ? 'success' : 'default'}
            className="h-2"
          />
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Started</span>
            </div>
            <div>{formatDate(stream.startTime)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{isCompleted ? 'Completed' : 'Time Left'}</span>
            </div>
            <div>
              {isCompleted ? formatDate(stream.endTime) : formatDuration(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Last Withdrawal */}
        {stream.lastWithdrawal && (
          <div className="text-sm">
            <div className="flex items-center space-x-1 text-muted-foreground mb-1">
              <Download className="w-3 h-3" />
              <span>Last Withdrawal</span>
            </div>
            <div>{formatDate(stream.lastWithdrawal)}</div>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3">
          <div className="flex w-full space-x-2">
            {viewType === 'employee' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleWithdraw}
                  disabled={!canWithdraw}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </>
            )}
            
            {viewType === 'employer' && (
              <>
                <Button
                  variant={isActive ? "secondary" : "default"}
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={!canToggle}
                  className="flex-1"
                >
                  {isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default StreamCard;

// Skeleton version for loading states
export const StreamCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="h-6 w-16 bg-muted rounded-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-5 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-5 w-24 bg-muted rounded" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <div className="flex w-full space-x-2">
          <div className="h-8 flex-1 bg-muted rounded" />
          <div className="h-8 flex-1 bg-muted rounded" />
        </div>
      </CardFooter>
    </Card>
  );
};