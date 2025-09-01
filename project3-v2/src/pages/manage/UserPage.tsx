import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'name', label: 'Full Name', type: 'text' as const, required: true },
  { name: 'email', label: 'Email Address', type: 'email' as const, required: true },
  { 
    name: 'role', 
    label: 'Role', 
    type: 'select' as const, 
    required: true,
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'manager', label: 'Manager' },
      { value: 'user', label: 'User' },
      { value: 'viewer', label: 'Viewer' },
    ]
  },
];

const validationSchema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  role: yup.string().required('Role is required'),
});

export function UserPage() {
  return (
    <CrudPage
      entityType="user"
      entityName="User"
      fields={fields}
      validationSchema={validationSchema}
    />
  );
}