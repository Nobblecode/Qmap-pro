import React from 'react';
import Card from '../components/Card'
import PageWrapper from '../components/PageWrapper'

const AppServer = () => {
  const layers = [
    { label: 'API Layer', icon: '🛠️', color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Business Logic', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
    { label: 'Middleware', icon: '🔁', color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <PageWrapper>
    <Card title="App Server">
      <div className="space-y-3">
        {layers.map((layer) => (
          <div
            key={layer.label}
            className={`flex items-center px-4 py-2 rounded-xl shadow-sm ${layer.color}`}
          >
            <span className="mr-2">{layer.icon}</span>
            <span className="font-medium">{layer.label}</span>
          </div>
        ))}
      </div>
    </Card>
    </PageWrapper>
  );
};

export default AppServer;
