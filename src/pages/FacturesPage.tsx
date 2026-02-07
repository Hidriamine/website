import React from 'react';
import { Card } from 'antd';
import InvoiceList from '../components/Invoices/InvoiceList';

const FacturesPage: React.FC = () => {
  return (
    <div>
      <h1>Gestion des factures</h1>
      <Card>
        <InvoiceList />
      </Card>
    </div>
  );
};

export default FacturesPage;