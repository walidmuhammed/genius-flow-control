import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  ShoppingBag, 
  FileText,
  Key,
  Activity
} from 'lucide-react';
import { useClientDetails } from '@/hooks/use-admin-clients';
import { AdminClientData } from '@/services/admin-clients';
import { formatDate } from '@/utils/format';
import StatusBadge from '@/components/orders/StatusBadge';

interface ClientDetailsPanelProps {
  client: AdminClientData | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailsPanel: React.FC<ClientDetailsPanelProps> = ({
  client,
  isOpen,
  onClose
}) => {
  const { data: clientDetails, isLoading } = useClientDetails(client?.id || null);

  if (!client) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-1/2 left-1/2 max-w-3xl w-full h-[80vh] p-0 z-50 flex flex-col translate-x-[-50%] translate-y-[-50%]">
        <div className="pt-8 px-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-extrabold mb-4 pt-2">
              <Building className="h-6 w-6" />
              {client.business_name || 'No Business Name'}
            </DialogTitle>
            <DialogDescription>
              Complete business information and account details
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-8 mt-2">
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="business" className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white">Business</TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white">Account</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white">Orders</TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white">Invoices</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white">Activity</TabsTrigger>
            </TabsList>

            {/* Business Information Tab */}
            <TabsContent value="business" className="space-y-4">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                      <p className="text-foreground">{client.business_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                      <p className="text-foreground">
                        <Badge variant="outline">{client.business_type || 'Not set'}</Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                      <p className="text-foreground">{client.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p className="text-foreground">{client.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                      <p className="text-foreground">{formatDate(new Date(client.created_at))}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="text-foreground">{getStatusBadge(client.status)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                      <p className="text-foreground">{client.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User Type</label>
                      <p className="text-foreground">
                        <Badge variant="secondary">{client.user_type}</Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                      <p className="text-foreground">{formatDate(new Date(client.created_at))}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-foreground">{formatDate(new Date(client.updated_at))}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="mr-2">
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Orders ({clientDetails?.orders?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  ) : clientDetails?.orders && clientDetails.orders.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientDetails.orders.slice(0, 10).map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono">#{order.order_id}</TableCell>
                              <TableCell>{order.customers?.name || 'N/A'}</TableCell>
                              <TableCell>
                                <StatusBadge status={(order.status || 'New') as any} />
                              </TableCell>
                              <TableCell>{formatDate(new Date(order.created_at))}</TableCell>
                              <TableCell>
                                ${(order.cash_collection_usd || 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No orders found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoices ({clientDetails?.invoices?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  ) : clientDetails?.invoices && clientDetails.invoices.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount (USD)</TableHead>
                            <TableHead>Amount (LBP)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientDetails.invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-mono">{invoice.invoice_id}</TableCell>
                              <TableCell>{formatDate(new Date(invoice.created_at))}</TableCell>
                              <TableCell>${invoice.total_amount_usd.toFixed(2)}</TableCell>
                              <TableCell>{invoice.total_amount_lbp.toLocaleString()} LL</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {invoice.net_payout_usd > 0 || invoice.net_payout_lbp > 0 ? 'Paid' : 'Pending'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No invoices found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(client.created_at))}
                        </p>
                      </div>
                    </div>
                    
                    {client.last_order_date && (
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <ShoppingBag className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Order Placed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(client.last_order_date))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsPanel;