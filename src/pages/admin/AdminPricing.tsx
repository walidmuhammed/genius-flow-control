
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Plus, Edit, Trash2, MapPin, Weight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Mock pricing data
const mockPricingRules = [
  {
    id: '1',
    name: 'Beirut Standard',
    zone: 'Beirut',
    base_price_usd: 5.00,
    base_price_lbp: 150000,
    weight_limit: 5,
    extra_weight_price_usd: 1.00,
    extra_weight_price_lbp: 30000,
    is_active: true
  },
  {
    id: '2',
    name: 'Mount Lebanon',
    zone: 'Mount Lebanon',
    base_price_usd: 7.00,
    base_price_lbp: 210000,
    weight_limit: 5,
    extra_weight_price_usd: 1.50,
    extra_weight_price_lbp: 45000,
    is_active: true
  },
  {
    id: '3',
    name: 'North Lebanon',
    zone: 'North Lebanon',
    base_price_usd: 10.00,
    base_price_lbp: 300000,
    weight_limit: 5,
    extra_weight_price_usd: 2.00,
    extra_weight_price_lbp: 60000,
    is_active: true
  },
  {
    id: '4',
    name: 'South Lebanon',
    zone: 'South Lebanon',
    base_price_usd: 12.00,
    base_price_lbp: 360000,
    weight_limit: 5,
    extra_weight_price_usd: 2.50,
    extra_weight_price_lbp: 75000,
    is_active: false
  }
];

const AdminPricing = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);

  document.title = "Pricing Management - Admin Dashboard";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pricing Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure delivery pricing rules by zone and weight
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#DC291E] hover:bg-[#DC291E]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Rule
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Zones</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {mockPricingRules.filter(rule => rule.is_active).length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Base Price</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    ${(mockPricingRules.reduce((sum, rule) => sum + rule.base_price_usd, 0) / mockPricingRules.length).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weight Limit</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">5kg</p>
                </div>
                <Weight className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Pricing Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ruleName">Rule Name</Label>
                    <Input id="ruleName" placeholder="e.g., Beirut Standard" />
                  </div>
                  <div>
                    <Label htmlFor="zone">Zone/Area</Label>
                    <Input id="zone" placeholder="e.g., Beirut, Mount Lebanon" />
                  </div>
                  <div>
                    <Label htmlFor="weightLimit">Weight Limit (kg)</Label>
                    <Input id="weightLimit" type="number" placeholder="5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="basePriceUSD">Base Price (USD)</Label>
                      <Input id="basePriceUSD" type="number" step="0.01" placeholder="5.00" />
                    </div>
                    <div>
                      <Label htmlFor="basePriceLBP">Base Price (LBP)</Label>
                      <Input id="basePriceLBP" type="number" placeholder="150000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="extraWeightUSD">Extra Weight Price (USD)</Label>
                      <Input id="extraWeightUSD" type="number" step="0.01" placeholder="1.00" />
                    </div>
                    <div>
                      <Label htmlFor="extraWeightLBP">Extra Weight Price (LBP)</Label>
                      <Input id="extraWeightLBP" type="number" placeholder="30000" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" />
                    <Label htmlFor="isActive">Active Rule</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#DC291E] hover:bg-[#DC291E]/90">
                  Save Pricing Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Weight Limit</TableHead>
                    <TableHead>Extra Weight Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPricingRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="font-medium">{rule.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {rule.zone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${rule.base_price_usd}</div>
                          <div className="text-sm text-gray-500">{rule.base_price_lbp.toLocaleString()} LBP</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-gray-400" />
                          {rule.weight_limit}kg
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${rule.extra_weight_price_usd}/kg</div>
                          <div className="text-sm text-gray-500">{rule.extra_weight_price_lbp.toLocaleString()} LBP/kg</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={rule.is_active 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
