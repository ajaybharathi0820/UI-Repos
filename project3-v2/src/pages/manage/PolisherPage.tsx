import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'firstName', label: 'First Name', type: 'text' as const, required: true },
  { name: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
  { name: 'contactNumber', label: 'Contact Number', type: 'text' as const, required: true },
];

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  contactNumber: yup.string()
    .matches(/^[+]?[\d\s-()]{10,15}$/, 'Please enter a valid contact number')
    .required('Contact number is required'),
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