
import React from 'react';
import { 
  PackageOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Wallet 
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';

const Dashboard: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="bg-genius-500 text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-2">
              GENIUS LOGISTICS
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, Walid</h1>
            <p className="text-gray-500 text-sm mt-1">
              {currentDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="New Orders In"
            value="24"
            icon={<PackageOpen className="h-6 w-6" />}
            trend={{ value: "+12% from yesterday", positive: true }}
          />
          
          <DashboardCard
            title="Delivered"
            value="186"
            icon={<CheckCircle className="h-6 w-6" />}
            trend={{ value: "+8.3% this week", positive: true }}
          />
          
          <DashboardCard
            title="In Progress"
            value="57"
            icon={<Clock className="h-6 w-6" />}
          />
          
          <DashboardCard
            title="Failed Orders"
            value="5"
            icon={<AlertCircle className="h-6 w-6" />}
            trend={{ value: "-2.5% this week", positive: true }}
          />
          
          <DashboardCard
            title="Avg. Order Value"
            value="$124.83"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: "+4.3% this month", positive: true }}
          />
          
          <DashboardCard
            title="Collected Cash"
            value={
              <div className="flex flex-col">
                <span>$9,827.40</span>
                <span className="text-sm text-gray-500">12,450,000 LBP</span>
              </div>
            }
            icon={<Wallet className="h-6 w-6" />}
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-genius-500 text-sm font-medium hover:text-genius-600 transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-genius-100 rounded-full flex items-center justify-center text-genius-600">
                    <PackageOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">New order #{13240 + item}</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="bg-genius-100 text-genius-600 px-3 py-1 rounded-full text-xs font-medium">
                  New Order
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
