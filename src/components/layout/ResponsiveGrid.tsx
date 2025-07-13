import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileCols?: 1 | 2 | 3;
  tabletCols?: 2 | 3 | 4 | 6 | 8;
  desktopCols?: 4 | 6 | 8 | 12;
  gap?: 2 | 3 | 4 | 6 | 8;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 4,
  gap = 4,
}) => {
  const gridClasses = cn(
    'grid',
    `grid-cols-${mobileCols}`,
    `md:grid-cols-${tabletCols}`,
    `lg:grid-cols-${desktopCols}`,
    `gap-${gap}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({ children, className }) => (
  <ResponsiveGrid
    mobileCols={1}
    tabletCols={2}
    desktopCols={4}
    gap={6}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children, className }) => (
  <ResponsiveGrid
    mobileCols={1}
    tabletCols={2}
    desktopCols={12}
    gap={6}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);