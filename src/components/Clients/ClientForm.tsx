import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { useData } from '../../context/DataContext';
import { Client } from '../../types';
import { DEFAULT_DELAI_FACTURATION } from '../../constants';

interface ClientFormProps {
  open: boolean;
  onCancel: () => void;
  client: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({ open, onCancel, client }) => {
  const [form] = Form.useForm();
  const { ajouterClient, modifierClient } = useData();

  useEffect(() => {
    if (open) {
      if (client) {
        form.setFieldsValue(client);
      } else {
        form.resetFields();
      }
    }
  }, [open, client, form]);

  // Validation personnalisée pour accepter un ou plusieurs emails
  const validateEmails = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('L\'email est obligatoire'));
    }

    // Séparer les emails par virgule et nettoyer les espaces
    const emails = value.split(',').map(email => email.trim());

    // Expression régulière pour valider un email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Vérifier que tous les emails sont valides
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return Promise.reject(
        new Error(`Email(s) invalide(s): ${invalidEmails.join(', ')}`)
      );
    }

    return Promise.resolve();
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      
      if (client) {
        modifierClient(client.id, values);
        message.success('Client modifié avec succès');
      } else {
        ajouterClient(values);
        message.success('Client ajouté avec succès');
      }
      
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  return (
    <Modal
      title={client ? 'Modifier le client' : 'Nouveau client'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={client ? 'Modifier' : 'Ajouter'}
      cancelText="Annuler"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          delaiFacturation: DEFAULT_DELAI_FACTURATION,
        }}
      >
        <Form.Item
          name="nom"
          label="Nom de l'entreprise"
          rules={[
            { required: true, message: 'Le nom est obligatoire' },
            { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
          ]}
        >
          <Input placeholder="Ex: Entreprise ABC" />
        </Form.Item>

        <Form.Item
          name="adresse"
          label="Adresse"
          rules={[{ required: true, message: 'L\'adresse est obligatoire' }]}
        >
          <Input placeholder="Ex: 15 Rue de la Paix" />
        </Form.Item>

        <Form.Item
          name="codePostal"
          label="Code postal"
          rules={[
            { required: true, message: 'Le code postal est obligatoire' },
            { pattern: /^\d{5}$/, message: 'Le code postal doit contenir 5 chiffres' },
          ]}
        >
          <Input placeholder="Ex: 75001" maxLength={5} />
        </Form.Item>

        <Form.Item
          name="ville"
          label="Ville"
          rules={[{ required: true, message: 'La ville est obligatoire' }]}
        >
          <Input placeholder="Ex: Paris" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { validator: validateEmails },
          ]}
          help="Vous pouvez entrer plusieurs emails séparés par des virgules (ex: contact@entreprise.fr, compta@entreprise.fr)"
        >
          <Input.TextArea
            placeholder="Ex: contact@entreprise.fr, comptabilite@entreprise.fr"
            autoSize={{ minRows: 1, maxRows: 3 }}
          />
        </Form.Item>

        <Form.Item
          name="siret"
          label="SIRET"
          rules={[
            { required: true, message: 'Le SIRET est obligatoire' },
            { pattern: /^\d{14}$/, message: 'Le SIRET doit contenir 14 chiffres' },
          ]}
        >
          <Input placeholder="Ex: 12345678900012" maxLength={14} />
        </Form.Item>

        <Form.Item
          name="delaiFacturation"
          label="Délai de facturation (en jours)"
          rules={[
            { required: true, message: 'Le délai est obligatoire' },
            { type: 'number', min: 1, message: 'Le délai doit être supérieur à 0' },
          ]}
        >
          <InputNumber
            placeholder="Ex: 30"
            min={1}
            max={365}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClientForm;