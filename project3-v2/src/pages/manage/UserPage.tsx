import { useState, useEffect } from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';
import ApiService from '../../services/api';
import type { Role } from '../../types';

export function UserPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await ApiService.getRoles() as Role[];
        console.log('Loaded roles:', rolesData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to load roles:', error);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, []);

  const roleOptions = roles.map(role => ({
    value: role.id,
    label: role.name
  }));

  const fields = [
    { name: 'firstName', label: 'First Name', type: 'text' as const, required: true },
    { name: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
    { name: 'username', label: 'Username', type: 'text' as const, required: true },
    { name: 'email', label: 'Email Address', type: 'email' as const, required: true },
    { name: 'password', label: 'Password', type: 'password' as const, required: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' as const, required: true },
    { 
      name: 'role', 
      label: 'Role', 
      type: 'select' as const, 
      required: true,
      options: roleOptions
    },
  ];

  const validationSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    username: yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    // Password is enforced only on create by CrudPage; optional here for updates
    password: yup
      .string()
      .transform((v) => (v === '' ? undefined : v))
      .min(6, 'Password must be at least 6 characters')
      .notRequired(),
    dateOfBirth: yup.date()
      .max(new Date(), 'Date of birth cannot be in the future')
      .required('Date of birth is required'),
    role: yup.string().required('Role is required'),
  });

  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <CrudPage
      entityType="user"
      entityName="User"
      fields={fields}
      validationSchema={validationSchema}
    />
  );
}