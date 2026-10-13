import React from 'react';
import Card from '../components/Card'
import PageWrapper from '../components/PageWrapper'

const Database = () => {
  const tables = ['Users', 'Transactions', 'Logs'];

  return (
    <PageWrapper>
    <Card title="Database">
      <div className="space-y-3 text-sm">
        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-center font-semibold">
          🔒 Encrypted & Secured
        </div>
        {tables.map((table) => (
          <div
            key={table}
            className="bg-green-100 text-green-800 px-4 py-2 rounded-xl shadow-sm"
          >
            📂 {table} Table
          </div>
        ))}
      </div>
    </Card>
    </PageWrapper>
  );
};

export default Database;
