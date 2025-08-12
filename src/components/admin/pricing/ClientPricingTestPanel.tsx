import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCalculateDeliveryFee } from '@/hooks/use-pricing';
import { useAdminClients } from '@/hooks/use-admin-clients';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCitiesByGovernorate } from '@/hooks/use-cities';

export function ClientPricingTestPanel() {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedPackageType, setSelectedPackageType] = useState<'Parcel' | 'Document' | 'Bulky'>('Parcel');

  const { data: clients } = useAdminClients();
  const { data: governorates } = useGovernorates();
  const { data: cities } = useCitiesByGovernorate(selectedGovernorateId);

  const { data: testResult, isLoading: testing, refetch: runTest } = useCalculateDeliveryFee(
    selectedClientId || undefined,
    selectedGovernorateId || undefined,
    selectedCityId || undefined,
    selectedPackageType
  );

  const handleTest = () => {
    if (selectedClientId) {
      runTest();
    }
  };

  const getResultColor = (ruleType: string) => {
    switch (ruleType) {
      case 'client_zone': return 'text-blue-600 bg-blue-50';
      case 'client_package': return 'text-purple-600 bg-purple-50';
      case 'client_default': return 'text-green-600 bg-green-50';
      case 'global': return 'text-gray-600 bg-gray-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getResultIcon = (ruleType: string) => {
    if (ruleType.startsWith('client_')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (ruleType === 'global') {
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Pricing System Test Panel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the pricing calculation system with different client configurations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.business_name || client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Package Type</label>
            <Select value={selectedPackageType} onValueChange={(value) => setSelectedPackageType(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parcel">Parcel</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Bulky">Bulky</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Governorate</label>
            <Select value={selectedGovernorateId} onValueChange={setSelectedGovernorateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select governorate" />
              </SelectTrigger>
              <SelectContent>
                {governorates?.map(gov => (
                  <SelectItem key={gov.id} value={gov.id}>
                    {gov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Select value={selectedCityId} onValueChange={setSelectedCityId} disabled={!selectedGovernorateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Test Button */}
        <Button 
          onClick={handleTest} 
          disabled={!selectedClientId || testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Run Pricing Test'}
        </Button>

        {/* Test Results */}
        {testResult && (
          <div className="mt-6 p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Test Results</h4>
              {getResultIcon(testResult.rule_type)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pricing Source:</span>
                <Badge className={getResultColor(testResult.rule_type)}>
                  {testResult.rule_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">USD Fee:</span>
                <span className="font-mono font-medium">${testResult.fee_usd}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">LBP Fee:</span>
                <span className="font-mono font-medium">{testResult.fee_lbp.toLocaleString()} LBP</span>
              </div>

              {/* Analysis */}
              <div className="mt-4 p-3 rounded border-l-4 border-l-blue-500 bg-blue-50 text-sm">
                <strong>Analysis:</strong>
                {testResult.rule_type === 'global' && (
                  <span className="ml-1 text-blue-700">
                    Using global pricing - no client-specific rules found.
                  </span>
                )}
                {testResult.rule_type === 'client_default' && (
                  <span className="ml-1 text-blue-700">
                    Using client's default pricing configuration.
                  </span>
                )}
                {testResult.rule_type === 'client_zone' && (
                  <span className="ml-1 text-blue-700">
                    Using client's zone-specific pricing rule for this location.
                  </span>
                )}
                {testResult.rule_type === 'client_package' && (
                  <span className="ml-1 text-blue-700">
                    Using client's default pricing + package type extra fee.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Test with Ahmed Fahmy */}
        <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Quick Test: Ahmed Fahmy</h4>
          <p className="text-sm text-green-700 mb-3">
            Ahmed Fahmy has client-specific pricing configured. Use his ID to test.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedClientId('40ccdbcd-fd25-4d6c-96e2-709c12559fbf');
              setSelectedGovernorateId('');
              setSelectedCityId('');
              setSelectedPackageType('Parcel');
            }}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            Load Ahmed Fahmy Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}