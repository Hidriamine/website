import React from 'react';
import { Card } from 'antd';
import SalariesTable from '../components/Salaries/SalariesTable';

const SalariesPage: React.FC = () => {
  return (
    <div>
      <h1>Gestion des salariés</h1>
      <Card>
        <SalariesTable />
      </Card>
    </div>
  );
};

export default SalariesPage;