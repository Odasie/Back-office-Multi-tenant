import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';

export const HeaderSearch: React.FC = () => {
  return (
    <div className="flex-1 max-w-sm">
      <GlobalSearch />
    </div>
  );
};