import React from 'react';
import Card from '../components/Card'
import PageWrapper from '../components/PageWrapper'

const LoadBalancer = () => {
  return (
    <PageWrapper>
    <Card title="Load Balancer">
      <div className="space-y-4 text-sm">
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl shadow-sm">
          Incoming Requests
        </div>
        <div className="bg-gray-200 px-4 py-2 rounded-xl text-center">
          🔐 Firewall / Proxy
        </div>
        <div className="flex flex-col space-y-2">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl shadow-sm">
            ➡ App Server
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl shadow-sm">
            ➡ Database
          </div>
        </div>
      </div>
    </Card>
    </PageWrapper>
  );
};

export default LoadBalancer;
