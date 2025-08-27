import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'name', label: 'Polisher Name', type: 'text' as const, required: true },
  { name: 'code', label: 'Code', type: 'text' as const, required: true },
  { 
    name: 'status', 
    label: 'Status', 
    type: 'select' as const, 
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'maintenance', label: 'Under Maintenance' },
    ]
  },
];

const validationSchema = yup.object({
  name: yup.string().required('Polisher name is required'),
  code: yup.string().required('Code is required'),
  status: yup.string().required('Status is required'),
});

export function PolisherPage() {
  return (
    <CrudPage
      entityType="polisher"
      entityName="Polisher"
      fields={fields}
      validationSchema={validationSchema}
    />
  );
}