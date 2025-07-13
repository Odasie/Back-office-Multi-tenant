import React, { useState, useEffect } from 'react';
import { Search, User, MapPin, Calendar, DollarSign, Ticket, CheckSquare } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockLeads, mockBookings, mockTasks, mockTickets, mockUsers } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'lead' | 'booking' | 'task' | 'ticket' | 'user';
  icon: React.ReactNode;
  action: () => void;
  metadata?: any;
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search function
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Search leads
    mockLeads.forEach(lead => {
      if (
        lead.title.toLowerCase().includes(lowerQuery) ||
        lead.customer_name.toLowerCase().includes(lowerQuery) ||
        lead.destination?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: lead.id,
          title: lead.title,
          subtitle: `${lead.customer_name} • ${lead.destination} • ${lead.status}`,
          type: 'lead',
          icon: <User className="h-4 w-4" />,
          action: () => navigate('/dashboard/sales'),
          metadata: lead
        });
      }
    });

    // Search bookings
    mockBookings.forEach(booking => {
      if (
        booking.customer_name.toLowerCase().includes(lowerQuery) ||
        booking.destination.toLowerCase().includes(lowerQuery) ||
        booking.booking_reference.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: booking.id,
          title: `${booking.destination} (${booking.booking_reference})`,
          subtitle: `${booking.customer_name} • ${booking.start_date} to ${booking.end_date}`,
          type: 'booking',
          icon: <Calendar className="h-4 w-4" />,
          action: () => navigate('/dashboard/operations'),
          metadata: booking
        });
      }
    });

    // Search tasks
    mockTasks.forEach(task => {
      if (
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: task.id,
          title: task.title,
          subtitle: `${task.status} • ${task.priority} priority • Due: ${new Date(task.due_date!).toLocaleDateString()}`,
          type: 'task',
          icon: <CheckSquare className="h-4 w-4" />,
          action: () => navigate('/dashboard/operations'),
          metadata: task
        });
      }
    });

    // Search tickets
    mockTickets.forEach(ticket => {
      if (
        ticket.title.toLowerCase().includes(lowerQuery) ||
        ticket.description?.toLowerCase().includes(lowerQuery) ||
        ticket.customer_email?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: ticket.id,
          title: ticket.title,
          subtitle: `${ticket.customer_email} • ${ticket.status} • ${ticket.priority}`,
          type: 'ticket',
          icon: <Ticket className="h-4 w-4" />,
          action: () => navigate('/dashboard/customer-service'),
          metadata: ticket
        });
      }
    });

    // Search users
    mockUsers.forEach(user => {
      if (
        user.first_name?.toLowerCase().includes(lowerQuery) ||
        user.last_name?.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: user.id,
          title: `${user.first_name} ${user.last_name}`,
          subtitle: `${user.email} • ${user.department} • ${user.role}`,
          type: 'user',
          icon: <User className="h-4 w-4" />,
          action: () => navigate('/settings'),
          metadata: user
        });
      }
    });

    setResults(searchResults.slice(0, 20)); // Limit to 20 results
  };

  const handleSelect = (result: SearchResult) => {
    result.action();
    setOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'booking': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'task': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ticket': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative justify-start text-sm text-muted-foreground w-full max-w-sm"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
        role="searchbox"
        aria-expanded={open}
      >
        <Search className="mr-2 h-4 w-4" />
        Search everything...
        <CommandShortcut>⌘K</CommandShortcut>
      </Button>
      
      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        aria-label="Global search dialog"
      >
        <CommandInput
          placeholder="Search leads, bookings, tasks, tickets, and users..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            performSearch(value);
          }}
          aria-label="Search input"
        />
        <CommandList>
          <CommandEmpty>
            {query.trim() ? 'No results found.' : 'Start typing to search...'}
          </CommandEmpty>
          
          {results.length > 0 && (
            <>
              {['lead', 'booking', 'task', 'ticket', 'user'].map(type => {
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;
                
                return (
                  <CommandGroup 
                    key={type} 
                    heading={`${type.charAt(0).toUpperCase() + type.slice(1)}s (${typeResults.length})`}
                  >
                    {typeResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        role="option"
                        aria-label={`${result.title} - ${result.subtitle}`}
                      >
                        <div className="flex items-center gap-2">
                          {result.icon}
                          <Badge variant="secondary" className={getTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;