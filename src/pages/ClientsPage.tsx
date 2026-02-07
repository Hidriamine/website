import React from 'react';
import { Card } from 'antd';
import ClientsTable from '../components/Clients/ClientsTable';

const ClientsPage: React.FC = () => {
  return (
    <div>
      <h1>Gestion des clients</h1>
      <Card>
        <ClientsTable />
      </Card>
    </div>
  );
};

export default ClientsPage;