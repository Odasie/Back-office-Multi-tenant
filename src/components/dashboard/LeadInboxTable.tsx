import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Filter, MoreHorizontal, Eye, Edit, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useLead } from '@/contexts/LeadContext';
import { Lead, LeadStatus } from '@/types/models';
import { format } from 'date-fns';

interface LeadInboxTableProps {
  searchTerm: string;
  onLeadSelect: (lead: Lead) => void;
}

const columnHelper = createColumnHelper<Lead>();

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-lead-new text-lead-new-foreground',
  contacted: 'bg-lead-contacted text-lead-contacted-foreground',
  qualified: 'bg-lead-qualified text-lead-qualified-foreground',
  proposal_sent: 'bg-warning text-warning-foreground',
  negotiating: 'bg-primary text-primary-foreground',
  awaiting_agency_confirm: 'bg-accent text-accent-foreground',
  confirmed: 'bg-success text-success-foreground',
  booked: 'bg-lead-converted text-lead-converted-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
  lost: 'bg-lead-lost text-lead-lost-foreground',
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  awaiting_agency_confirm: 'Agency Confirm',
  confirmed: 'Confirmed',
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
  lost: 'Lost',
};

export default function LeadInboxTable({ searchTerm, onLeadSelect }: LeadInboxTableProps) {
  const { leads, setFilters, filters } = useLead();
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');

  const columns: ColumnDef<Lead, any>[] = useMemo(() => [
    columnHelper.accessor('customer_name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 h-auto font-medium"
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.assigned_agent?.avatar_url} />
            <AvatarFallback className="text-xs">
              {row.original.customer_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{row.original.customer_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.customer_email}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Lead Title',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.title}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {row.original.destination || 'No destination'}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status]} variant="secondary">
          {statusLabels[row.original.status]}
        </Badge>
      ),
    }),
    columnHelper.accessor('source', {
      header: 'Source',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-background">
          {row.original.source || 'Unknown'}
        </Badge>
      ),
    }),
    columnHelper.accessor('estimated_value', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 h-auto font-medium"
        >
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-foreground font-medium">
          <DollarSign className="h-3 w-3" />
          ฿{(row.original.estimated_value || 0).toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor('assigned_agent', {
      header: 'Agent',
      cell: ({ row }) => {
        const agent = row.original.assigned_agent;
        return agent ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback className="text-xs">
                {agent.first_name?.charAt(0)}{agent.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">
              {agent.first_name} {agent.last_name}
            </span>
          </div>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Unassigned
          </Badge>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 h-auto font-medium"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLeadSelect(row.original)}
            className="hover:bg-accent"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-accent">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [onLeadSelect]);

  // Filter leads based on search term and filters
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sourceFilter && sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (destinationFilter && destinationFilter !== 'all') {
      filtered = filtered.filter(lead => lead.destination === destinationFilter);
    }

    return filtered;
  }, [leads, searchTerm, sourceFilter, statusFilter, destinationFilter]);

  const table = useReactTable({
    data: filteredLeads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Get unique values for filters
  const sources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];
  const destinations = [...new Set(leads.map(lead => lead.destination).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Lead Inbox</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent">
              {filteredLeads.length} leads
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={destinationFilter} onValueChange={setDestinationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Destinations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              {destinations.map(destination => (
                <SelectItem key={destination} value={destination}>
                  {destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-muted-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-accent/50 cursor-pointer border-border"
                    onClick={() => onLeadSelect(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()} pages
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}