import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Upload, Search, Check, X, AlertTriangle } from 'lucide-react';

// Mock reconciliation data
const mockReconciliationData = [
  {
    id: '1',
    date: '2024-01-23',
    bookingRef: 'ODS-2024-001',
    customerName: 'Amanda Wilson',
    systemAmount: 37500,
    bankAmount: 37500,
    status: 'matched',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN_001_20240110'
  },
  {
    id: '2',
    date: '2024-01-22',
    bookingRef: 'ODS-2024-002',
    customerName: 'James Miller',
    systemAmount: 46000,
    bankAmount: 45800,
    status: 'discrepancy',
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN_003_20240112',
    notes: 'Bank fees deducted'
  },
  {
    id: '3',
    date: '2024-01-21',
    bookingRef: null,
    customerName: 'Unknown Transfer',
    systemAmount: 0,
    bankAmount: 15000,
    status: 'unmatched',
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN_UNK_20240121'
  },
  {
    id: '4',
    date: '2024-01-20',
    bookingRef: 'ODS-2024-003',
    customerName: 'Sarah Johnson',
    systemAmount: 28500,
    bankAmount: null,
    status: 'pending',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN_004_20240120'
  }
];

export default function ReconciliationTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredData = mockReconciliationData.filter(item => {
    const matchesSearch = item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">
          <Check className="w-3 h-3 mr-1" />
          Matched
        </Badge>;
      case 'discrepancy':
        return <Badge variant="default" className="bg-warning/10 text-warning border-warning/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Discrepancy
        </Badge>;
      case 'unmatched':
        return <Badge variant="default" className="bg-destructive/10 text-destructive border-destructive/20">
          <X className="w-3 h-3 mr-1" />
          Unmatched
        </Badge>;
      case 'pending':
        return <Badge variant="outline">
          Pending
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAmountDisplay = (systemAmount: number | null, bankAmount: number | null) => {
    if (systemAmount && bankAmount) {
      const difference = Math.abs(systemAmount - bankAmount);
      const hasDiscrepancy = difference > 0;
      
      return (
        <div className="space-y-1">
          <div className="font-medium">฿{systemAmount.toLocaleString()}</div>
          <div className={`text-sm ${hasDiscrepancy ? 'text-warning' : 'text-muted-foreground'}`}>
            Bank: ฿{bankAmount.toLocaleString()}
            {hasDiscrepancy && (
              <span className="ml-1 text-warning">
                (฿{difference.toLocaleString()} diff)
              </span>
            )}
          </div>
        </div>
      );
    }
    
    if (systemAmount) {
      return <div className="font-medium">฿{systemAmount.toLocaleString()}</div>;
    }
    
    if (bankAmount) {
      return <div className="font-medium text-info">฿{bankAmount.toLocaleString()}</div>;
    }
    
    return <div className="text-muted-foreground">-</div>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Reconciliation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Match system payments with bank transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button size="sm">Auto-Match</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by customer, booking ref, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="matched">Matched</option>
            <option value="discrepancy">Discrepancy</option>
            <option value="unmatched">Unmatched</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Booking Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {new Date(item.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {item.bookingRef ? (
                    <span className="font-mono text-sm">{item.bookingRef}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell>
                  {getAmountDisplay(item.systemAmount, item.bankAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.paymentMethod}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{item.transactionId}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {item.status === 'discrepancy' && (
                      <Button variant="outline" size="sm">Resolve</Button>
                    )}
                    {item.status === 'unmatched' && (
                      <Button variant="outline" size="sm">Match</Button>
                    )}
                    {item.status === 'pending' && (
                      <Button variant="outline" size="sm">Confirm</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}