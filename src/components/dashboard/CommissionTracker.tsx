import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp, Building, Percent } from 'lucide-react';

// Mock commission data
const mockCommissionData = [
  {
    id: '1',
    bookingRef: 'ODS-2024-001',
    customer: 'Amanda Wilson',
    destination: 'Pattaya',
    bookingValue: 75000,
    markupType: '55% + 10%',
    grossMargin: 48750, // 65% of booking value
    evaneosFee: 9000, // 12% of booking value
    partnerCommission: 6000, // 8% for B2B
    netProfit: 33750,
    profitMargin: 45.0,
    status: 'calculated'
  },
  {
    id: '2',
    bookingRef: 'ODS-2024-002',
    customer: 'James Miller',
    destination: 'Hua Hin',
    bookingValue: 92000,
    markupType: '45%',
    grossMargin: 41400, // 45% markup
    evaneosFee: 11040, // 12% of booking value
    partnerCommission: 0, // Direct booking
    netProfit: 30360,
    profitMargin: 33.0,
    status: 'calculated'
  },
  {
    id: '3',
    bookingRef: 'ODS-2024-003',
    customer: 'Corporate Group',
    destination: 'Koh Samui',
    bookingValue: 180000,
    markupType: '55% + 10%',
    grossMargin: 117000, // 65% markup for corporate
    evaneosFee: 21600, // 12% of booking value
    partnerCommission: 14400, // 8% B2B commission
    netProfit: 81000,
    profitMargin: 45.0,
    status: 'calculated'
  },
  {
    id: '4',
    bookingRef: 'ODS-2024-004',
    customer: 'Sarah Johnson',
    destination: 'Chiang Mai',
    bookingValue: 28500,
    markupType: '45%',
    grossMargin: 12825, // 45% markup
    evaneosFee: 3420, // 12% of booking value
    partnerCommission: 0,
    netProfit: 9405,
    profitMargin: 33.0,
    status: 'pending'
  }
];

export default function CommissionTracker() {
  const [selectedMarkup, setSelectedMarkup] = useState<'55plus10' | '45'>('55plus10');

  const totalBookingValue = mockCommissionData.reduce((sum, item) => sum + item.bookingValue, 0);
  const totalGrossMargin = mockCommissionData.reduce((sum, item) => sum + item.grossMargin, 0);
  const totalEvaneosFees = mockCommissionData.reduce((sum, item) => sum + item.evaneosFee, 0);
  const totalPartnerCommissions = mockCommissionData.reduce((sum, item) => sum + item.partnerCommission, 0);
  const totalNetProfit = mockCommissionData.reduce((sum, item) => sum + item.netProfit, 0);
  const averageProfitMargin = totalBookingValue > 0 ? (totalNetProfit / totalBookingValue) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'calculated':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">Calculated</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Commission Tracker
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-calculated markups and profit margins
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedMarkup === '55plus10' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMarkup('55plus10')}
            >
              55% + 10%
            </Button>
            <Button 
              variant={selectedMarkup === '45' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMarkup('45')}
            >
              45% Fixed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Bookings</div>
            <div className="text-lg font-semibold">฿{totalBookingValue.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Gross Margin</div>
            <div className="text-lg font-semibold text-success">฿{totalGrossMargin.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Evaneos Fees</div>
            <div className="text-lg font-semibold text-destructive">฿{totalEvaneosFees.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Net Profit</div>
            <div className="text-lg font-semibold text-primary">฿{totalNetProfit.toLocaleString()}</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Markup</TableHead>
              <TableHead>Gross Margin</TableHead>
              <TableHead>Evaneos (12%)</TableHead>
              <TableHead>B2B Commission</TableHead>
              <TableHead>Net Profit</TableHead>
              <TableHead>Margin %</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCommissionData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{item.bookingRef}</div>
                    <div className="text-xs text-muted-foreground">{item.customer}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ฿{item.bookingValue.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.markupType}</Badge>
                </TableCell>
                <TableCell className="text-success font-medium">
                  ฿{item.grossMargin.toLocaleString()}
                </TableCell>
                <TableCell className="text-destructive">
                  ฿{item.evaneosFee.toLocaleString()}
                </TableCell>
                <TableCell className="text-warning">
                  {item.partnerCommission > 0 ? `฿${item.partnerCommission.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-primary font-medium">
                  ฿{item.netProfit.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {item.profitMargin.toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Average profit margin: <span className="font-medium text-foreground">{averageProfitMargin.toFixed(1)}%</span>
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}