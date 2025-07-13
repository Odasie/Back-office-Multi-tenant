import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

interface AnimatedKpiCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  formatValue?: (value: number) => string;
  className?: string;
  delay?: number;
}

export const AnimatedKpiCard: React.FC<AnimatedKpiCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
  formatValue,
  className,
  delay = 0,
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatChange = (changeValue: number) => {
    const prefix = changeValue > 0 ? '+' : '';
    return `${prefix}${changeValue}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: 'easeOut'
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      <Card className="h-full transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary/20 hover:border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="h-4 w-4 text-muted-foreground">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              <AnimatedCounter
                value={value}
                formatValue={formatValue}
                duration={1000}
              />
            </div>
            
            <div className="flex items-center justify-between">
              {change !== undefined && (
                <Badge variant="secondary" className={cn("text-xs", getChangeColor())}>
                  {formatChange(change)}
                </Badge>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};