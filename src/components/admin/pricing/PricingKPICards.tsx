import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MapPin, Users, Clock } from 'lucide-react';
import { usePricingKPIs } from '@/hooks/use-pricing';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';

const PricingKPICards = () => {
  const { data: kpis, isLoading } = usePricingKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="gradient-border-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Global Default Fee</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(kpis?.global_default_fee_usd || 0, 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(kpis?.global_default_fee_lbp || 0, 'LBP')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-border-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Zone Rules</CardTitle>
          <MapPin className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">
            {kpis?.zone_rules_count || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Active zone-based pricing rules
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-border-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Client Overrides</CardTitle>
          <Users className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {kpis?.client_overrides_count || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Custom client pricing rules
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-border-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {kpis?.last_updated ? format(new Date(kpis.last_updated), 'MMM dd') : 'Never'}
            </div>
            <Badge variant="outline" className="text-xs">
              {kpis?.last_updated ? format(new Date(kpis.last_updated), 'HH:mm') : 'N/A'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingKPICards;