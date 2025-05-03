
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Download, Eye, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InvoiceData {
  id: string;
  merchantName: string;
  totalUSD: number;
  totalLBP: number | null;
  paidDate: string;
}

const invoicesData: InvoiceData[] = [
  {
    id: "INV-7896",
    merchantName: "Beirut Electronics",
    totalUSD: 1250.75,
    totalLBP: 19250000,
    paidDate: "May 2, 2025"
  },
  {
    id: "INV-7895",
    merchantName: "Mont Lebanon Supplies",
    totalUSD: 876.50,
    totalLBP: 13500000,
    paidDate: "May 1, 2025"
  },
  {
    id: "INV-7894",
    merchantName: "Tripoli Pharma",
    totalUSD: 2350.25,
    totalLBP: 36150000,
    paidDate: "Apr 30, 2025"
  },
  {
    id: "INV-7893",
    merchantName: "Byblos Market",
    totalUSD: 450.00,
    totalLBP: 6930000,
    paidDate: "Apr 28, 2025"
  },
  {
    id: "INV-7892",
    merchantName: "Saida Textiles",
    totalUSD: 1875.30,
    totalLBP: 28880000,
    paidDate: "Apr 25, 2025"
  },
  {
    id: "INV-7891",
    merchantName: "Tyre Fish Market",
    totalUSD: 542.75,
    totalLBP: 8360000,
    paidDate: "Apr 22, 2025"
  },
  {
    id: "INV-7890",
    merchantName: "Baalbek Sweets",
    totalUSD: 328.90,
    totalLBP: 5060000,
    paidDate: "Apr 20, 2025"
  }
];

const Wallet: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-gray-500">Manage invoices and payments</p>
        </div>

        <Card className="border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Paid Orders Invoices List</h2>
          </div>
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search invoices by ID or merchant..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Download className="h-4 w-4" /> Export Invoices
            </Button>
          </div>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Invoice ID</TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Merchant Name</TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Total USD</TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Total LBP</TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Paid Date</TableHead>
                    <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-blue-600">
                        {invoice.id}
                      </TableCell>
                      <TableCell>
                        {invoice.merchantName}
                      </TableCell>
                      <TableCell>
                        ${invoice.totalUSD.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {invoice.totalLBP?.toLocaleString()} LBP
                      </TableCell>
                      <TableCell>
                        {invoice.paidDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Printer className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">7</span> invoices
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Wallet;
