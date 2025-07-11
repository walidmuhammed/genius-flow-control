
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminClientKPICards from '@/components/admin/AdminClientKPICards';
import AdminClientsTable from '@/components/admin/AdminClientsTable';
import ClientDetailsPanel from '@/components/admin/ClientDetailsPanel';
import AddClientModal from '@/components/admin/AddClientModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminClientData } from '@/services/admin-clients';

const AdminClients = () => {
  document.title = "Clients Management - Admin Panel";
  
  const [selectedClient, setSelectedClient] = useState<AdminClientData | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const handleViewClient = (client: AdminClientData) => {
    setSelectedClient(client);
    setIsDetailsPanelOpen(true);
  };

  const handleEditClient = (client: AdminClientData) => {
    // For now, just view the client details
    // TODO: Add edit functionality
    handleViewClient(client);
  };

  const handleCloseDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    setSelectedClient(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Clients Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage all registered business accounts
            </p>
          </div>
          <Button onClick={() => setIsAddClientModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* KPI Cards */}
        <AdminClientKPICards />

        {/* Clients Table */}
        <div className="bg-background border rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Client Accounts</h3>
            <AdminClientsTable 
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
            />
          </div>
        </div>

        {/* Client Details Panel */}
        <ClientDetailsPanel
          client={selectedClient}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetailsPanel}
        />

        {/* Add Client Modal */}
        <AddClientModal
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminClients;
