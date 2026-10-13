import React from 'react';
import Card from '../components/Card'
import PageWrapper from '../components/PageWrapper'

const GlobalMerchantGateway = () => {
  const gateways = [
    { name: 'Stripe', icon: '💳', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'PayPal', icon: '🅿️', color: 'bg-blue-100 text-blue-800' },
    { name: 'Crypto Gateway', icon: '🪙', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <PageWrapper>
    <Card title="Global Merchant Gateway">
      <div className="space-y-3">
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl text-sm text-center">
          🔐 Secured API Gateway
        </div>
        {gateways.map((g) => (
          <div
            key={g.name}
            className={`flex items-center px-4 py-2 rounded-xl shadow-sm ${g.color}`}
          >
            <span className="mr-2 text-lg">{g.icon}</span>
            <span className="font-medium">{g.name}</span>
          </div>
        ))}
      </div>
    </Card>
    </PageWrapper>
  );
};

export default GlobalMerchantGateway;
