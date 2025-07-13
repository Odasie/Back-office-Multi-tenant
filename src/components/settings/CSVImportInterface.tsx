import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

type ImportType = 'leads' | 'tasks' | 'tickets' | 'bookings' | 'payments';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
}

const columnMappings = {
  leads: [
    'title', 'customer_name', 'customer_email', 'customer_phone', 
    'destination', 'source', 'status', 'notes', 'estimated_value', 
    'booking_type', 'department'
  ],
  tasks: [
    'title', 'description', 'status', 'priority', 'due_date', 
    'assigned_to', 'related_lead_id', 'related_booking_id'
  ],
  tickets: [
    'title', 'description', 'status', 'priority', 'category',
    'customer_email', 'customer_phone', 'assigned_to', 'related_booking_id'
  ],
  bookings: [
    'booking_reference', 'customer_name', 'customer_email', 'customer_phone',
    'destination', 'start_date', 'end_date', 'total_amount', 'currency',
    'booking_type', 'status', 'lead_id'
  ],
  payments: [
    'amount', 'currency', 'status', 'payment_method', 'due_date',
    'paid_date', 'notes', 'booking_id'
  ]
};

export default function CSVImportInterface() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [importType, setImportType] = useState<ImportType>('leads');
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  const columnHelper = createColumnHelper<CSVRow>();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: 'Error',
            description: 'Failed to parse CSV file',
            variant: 'destructive',
          });
          return;
        }

        const data = results.data as CSVRow[];
        const headers = Object.keys(data[0] || {});
        
        setCsvData(data);
        setCsvHeaders(headers);
        
        // Auto-map columns based on similar names
        const autoMappings = columnMappings[importType].map(dbCol => {
          const csvCol = headers.find(h => 
            h.toLowerCase().replace(/[_\s]/g, '') === dbCol.toLowerCase().replace(/[_\s]/g, '')
          );
          return { csvColumn: csvCol || '', dbColumn: dbCol };
        });
        
        setMappings(autoMappings);
        setImportResults(null);
        
        toast({
          title: 'Success',
          description: `Loaded ${data.length} rows from CSV`,
        });
      },
      error: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  }, [importType, toast]);

  const updateMapping = (dbColumn: string, csvColumn: string) => {
    setMappings(prev => 
      prev.map(mapping => 
        mapping.dbColumn === dbColumn 
          ? { ...mapping, csvColumn }
          : mapping
      )
    );
  };

  const transformRowForImport = (row: CSVRow): any => {
    const transformed: any = { tenant_id: profile?.tenant_id };
    
    mappings.forEach(({ csvColumn, dbColumn }) => {
      if (csvColumn && row[csvColumn] !== undefined) {
        let value = row[csvColumn];
        
        // Type conversions based on column names
        if (dbColumn.includes('_date') || dbColumn.includes('due_date') || dbColumn.includes('paid_date')) {
          transformed[dbColumn] = value ? new Date(value).toISOString() : null;
        } else if (dbColumn === 'estimated_value' || dbColumn === 'total_amount' || dbColumn === 'amount') {
          transformed[dbColumn] = value ? parseFloat(value.replace(/[^\d.-]/g, '')) : null;
        } else if (dbColumn === 'is_active') {
          transformed[dbColumn] = value.toLowerCase() === 'true';
        } else {
          transformed[dbColumn] = value;
        }
      }
    });
    
    return transformed;
  };

  const handleImport = async () => {
    if (!profile?.tenant_id) {
      toast({
        title: 'Error',
        description: 'Tenant information not available',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    
    const results = { success: 0, errors: [] as string[] };
    const batchSize = 100;
    
    try {
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        const transformedBatch = batch.map(transformRowForImport);
        
        const { error } = await supabase
          .from(importType)
          .insert(transformedBatch);
        
        if (error) {
          results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          results.success += batch.length;
        }
        
        setImportProgress(Math.round(((i + batch.length) / csvData.length) * 100));
      }
      
      setImportResults(results);
      
      if (results.errors.length === 0) {
        toast({
          title: 'Success',
          description: `Successfully imported ${results.success} records`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Imported ${results.success} records with ${results.errors.length} errors`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Import failed',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const tableColumns = csvHeaders.map(header =>
    columnHelper.accessor(header, {
      header: header,
      cell: info => (
        <div className="max-w-[200px] truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    })
  );

  const table = useReactTable({
    data: csvData.slice(0, 10), // Show only first 10 rows for preview
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Select a CSV file to import data into your CRM system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-type">Import Type</Label>
            <Select value={importType} onValueChange={(value: ImportType) => setImportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="tickets">Support Tickets</SelectItem>
                <SelectItem value="bookings">Bookings</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Column Mapping */}
      {csvHeaders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map CSV columns to database fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mappings.map(({ dbColumn, csvColumn }) => (
                <div key={dbColumn} className="flex items-center gap-2">
                  <Label className="w-32 text-sm font-mono">{dbColumn}</Label>
                  <Select value={csvColumn} onValueChange={(value) => updateMapping(dbColumn, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Skip --</SelectItem>
                      {csvHeaders.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Preview
            </CardTitle>
            <CardDescription>
              Preview of the first 10 rows from your CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {csvData.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing 10 of {csvData.length} rows
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Controls */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import the mapped data into your CRM system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isImporting && (
              <div className="space-y-2">
                <Progress value={importProgress} />
                <p className="text-sm text-muted-foreground">
                  Importing... {importProgress}%
                </p>
              </div>
            )}
            
            {importResults && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Successfully imported {importResults.success} records</span>
                </div>
                {importResults.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{importResults.errors.length} errors occurred:</span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-2 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-700">{error}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleImport} 
              disabled={isImporting || mappings.every(m => !m.csvColumn)}
              className="w-full"
            >
              {isImporting ? 'Importing...' : `Import ${csvData.length} Records`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}