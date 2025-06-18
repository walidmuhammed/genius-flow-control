
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const SecuritySection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security</h2>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
