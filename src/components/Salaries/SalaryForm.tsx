import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { useData } from '../../context/DataContext';
import { Salarie } from '../../types';

interface SalaryFormProps {
  open: boolean;
  onCancel: () => void;
  salarie: Salarie | null;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ open, onCancel, salarie }) => {
  const [form] = Form.useForm();
  const { ajouterSalarie, modifierSalarie, clients } = useData();

  useEffect(() => {
    if (open) {
      if (salarie) {
        form.setFieldsValue(salarie);
      } else {
        form.resetFields();
      }
    }
  }, [open, salarie, form]);

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      
      if (salarie) {
        modifierSalarie(salarie.id, values);
        message.success('Salarié modifié avec succès');
      } else {
        ajouterSalarie(values);
        message.success('Salarié ajouté avec succès');
      }
      
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  return (
    <Modal
      title={salarie ? 'Modifier le salarié' : 'Nouveau salarié'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={salarie ? 'Modifier' : 'Ajouter'}
      cancelText="Annuler"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="prenom"
          label="Prénom"
          rules={[
            { required: true, message: 'Le prénom est obligatoire' },
            { min: 2, message: 'Le prénom doit contenir au moins 2 caractères' },
          ]}
        >
          <Input placeholder="Ex: Jean" />
        </Form.Item>

        <Form.Item
          name="nom"
          label="Nom"
          rules={[
            { required: true, message: 'Le nom est obligatoire' },
            { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
          ]}
        >
          <Input placeholder="Ex: Dupont" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'L\'email est obligatoire' },
            { type: 'email', message: 'L\'email n\'est pas valide' },
          ]}
        >
          <Input placeholder="Ex: jean.dupont@exemple.fr" />
        </Form.Item>

        <Form.Item
          name="telephone"
          label="Téléphone"
          rules={[
            { required: false },
            { pattern: /^\+?[0-9\s\-()]+$/, message: 'Le numéro de téléphone n\'est pas valide' },
          ]}
          help="Format international recommandé (ex: +33612345678) pour les rappels SMS"
        >
          <Input placeholder="Ex: +33612345678" />
        </Form.Item>

        <Form.Item
          name="poste"
          label="Poste"
          rules={[{ required: true, message: 'Le poste est obligatoire' }]}
        >
          <Input placeholder="Ex: Développeur Senior" />
        </Form.Item>

        <Form.Item
          name="reference"
          label="Référence"
          rules={[{ required: false }]}
        >
          <Input placeholder="Ex: REF-2025-001" />
        </Form.Item>

        <Form.Item
          name="tauxJournalier"
          label="Taux journalier (€/jour)"
          rules={[
            { required: true, message: 'Le taux journalier est obligatoire' },
            { type: 'number', min: 1, message: 'Le taux doit être supérieur à 0' },
          ]}
        >
          <InputNumber
            placeholder="Ex: 450"
            min={1}
            max={10000}
            style={{ width: '100%' }}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="clientId"
          label="Client"
          rules={[{ required: true, message: 'Le client est obligatoire' }]}
        >
          <Select
            placeholder="Sélectionner un client"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
              //(option?.children as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {clients.map((client) => (
              <Select.Option key={client.id} value={client.id}>
                {client.nom}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SalaryForm;