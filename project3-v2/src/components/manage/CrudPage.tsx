import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Edit2, Trash2, Plus, Search, Key, X } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '../layout/Layout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import ApiService from '../../services/api';
import type { User, Polisher, BagType, Product } from '../../types';
import { useNavigate } from 'react-router-dom';

interface CrudField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'email' | 'password' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: any;
}

interface CrudPageProps {
  entityType: string;
  entityName: string;
  fields: CrudField[];
  // Can be a static Yup schema, or a factory that returns a schema based on edit mode
  validationSchema: any | ((isEdit: boolean) => any);
}

export function CrudPage({ entityType, entityName, fields, validationSchema }: CrudPageProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  // Support dynamic schema based on whether we are editing or creating
  const computedSchema = typeof validationSchema === 'function'
    ? validationSchema(!!editingEntity)
    : validationSchema;

  const { register, handleSubmit, formState: { errors }, reset, setValue, setError } = useForm({
    resolver: yupResolver(computedSchema),
  });

  // Load entities
  const loadEntities = async () => {
    setIsLoading(true);
    try {
      let data;
      switch (entityType) {
        case 'user':
          data = await ApiService.getUsers();
          break;
        case 'polisher':
          data = await ApiService.getPolishers();
          break;
        case 'bag-type':
          data = await ApiService.getBagTypes();
          break;
        case 'product':
          data = await ApiService.getProducts();
          break;
        default:
          data = [];
      }
      
      console.log(`${entityType} API Response:`, data);
      
      // Check if data is wrapped in a response object
      const entities = Array.isArray(data) ? data : (data?.data || data?.result || []);
      console.log(`${entityType} Entities:`, entities);
      
      setEntities(entities);
      setFilteredEntities(entities);
    } catch (error) {
      console.error('Failed to load entities:', error);
      const message = error instanceof Error ? error.message : `Failed to load ${entityName.toLowerCase()}s`;
      toast.error(message);
      // Set empty arrays on error so UI shows "no records found"
      setEntities([]);
      setFilteredEntities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter entities based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEntities(entities);
    } else {
      const filtered = entities.filter(entity =>
        fields.some(field => {
          const value = entity[field.name];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
      setFilteredEntities(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, entities, fields]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex);

  useEffect(() => {
    loadEntities();
  }, [entityType]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Special case: user creation requires password, but updates don't
      if (entityType === 'user' && !editingEntity) {
        if (!data.password || String(data.password).trim().length === 0) {
          setError('password' as any, { type: 'required', message: 'Password is required' } as any);
          setIsSubmitting(false);
          return;
        }
      }

      // Handle dateOfBirth to ensure it's sent as YYYY-MM-DD string
      if (data.dateOfBirth && typeof data.dateOfBirth !== 'string') {
        data.dateOfBirth = data.dateOfBirth.toISOString().split('T')[0];
      }

      let newEntity;
      
      if (editingEntity) {
        // Update existing entity
        switch (entityType) {
          case 'user':
            newEntity = await ApiService.updateUser(editingEntity.id, data);
            break;
          case 'polisher':
            newEntity = await ApiService.updatePolisher(editingEntity.id, data);
            break;
          case 'bag-type':
            newEntity = await ApiService.updateBagType(editingEntity.id, data);
            break;
          case 'product':
            newEntity = await ApiService.updateProduct(editingEntity.id, data);
            break;
        }
        
        setEntities(prev => prev.map(entity => 
          entity.id === editingEntity.id ? newEntity : entity
        ));
        setFilteredEntities(prev => prev.map(entity => 
          entity.id === editingEntity.id ? newEntity : entity
        ));
        toast.success(`${entityName} updated successfully!`);
        setEditingEntity(null);
      } else {
        // Create new entity
        switch (entityType) {
          case 'user':
            newEntity = await ApiService.createUser(data);
            break;
          case 'polisher':
            newEntity = await ApiService.createPolisher(data);
            break;
          case 'bag-type':
            newEntity = await ApiService.createBagType(data);
            break;
          case 'product':
            newEntity = await ApiService.createProduct(data);
            break;
        }
        
        setEntities(prev => [newEntity, ...prev]);
        setFilteredEntities(prev => [newEntity, ...prev]);
        toast.success(`${entityName} created successfully!`);
      }

      reset();
    } catch (error) {
      console.error('Failed to save entity:', error);
      const message = error instanceof Error ? error.message : `Failed to save ${entityName.toLowerCase()}`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    reset();
  };

  const handleEdit = (entity: any) => {
    setEditingEntity(entity);
    fields.forEach(field => {
      let value = entity[field.name];
      
      // Handle special field mappings
      if (field.name === 'username' && entity.userName) {
        value = entity.userName;
      } else if (field.name === 'dateOfBirth') {
        if (entity.dateOfBirth) {
          // Handle date properly to avoid timezone issues
          if (typeof entity.dateOfBirth === 'string' && entity.dateOfBirth.includes('T')) {
            // If it's an ISO string, extract just the date part
            value = entity.dateOfBirth.split('T')[0];
          } else if (typeof entity.dateOfBirth === 'string') {
            // If it's already in YYYY-MM-DD format
            value = entity.dateOfBirth;
          } else {
            // If it's a Date object, use toISOString and extract date part
            const d = new Date(entity.dateOfBirth);
            value = d.toISOString().split('T')[0];
          }
        }
      } else if (field.name === 'role' && field.options) {
        // For role field, try to find the role ID from the role name
        const roleOption = field.options.find(option => option.label === entity.role);
        value = roleOption ? roleOption.value : entity.role;
      }
      
      setValue(field.name, value || '');
    });
  };

  const handleDelete = async (id: string) => {
    try {
      switch (entityType) {
        case 'user':
          await ApiService.deleteUser(id);
          break;
        case 'polisher':
          await ApiService.deletePolisher(id);
          break;
        case 'bag-type':
          await ApiService.deleteBagType(id);
          break;
        case 'product':
          await ApiService.deleteProduct(id);
          break;
      }
      
      setEntities(prev => prev.filter(entity => entity.id !== id));
      setFilteredEntities(prev => prev.filter(entity => entity.id !== id));
      toast.success(`${entityName} deleted successfully!`);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete entity:', error);
      const message = error instanceof Error ? error.message : `Failed to delete ${entityName.toLowerCase()}`;
      toast.error(message);
    }
  };

  const cancelEdit = () => {
    setEditingEntity(null);
    reset();
  };

  const renderField = (field: CrudField) => {
    // For password field, required only when creating (no editingEntity)
    const isPassword = field.type === 'password' || field.name === 'password';
    const isRequired = isPassword ? !editingEntity : field.required;
    if (field.type === 'select' && field.options) {
      return (
        <Select
          key={field.name}
          label={field.label}
          required={isRequired}
          options={field.options}
          {...register(field.name)}
          error={errors[field.name]?.message as string}
        />
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        type={field.type}
        required={isRequired}
        disabled={isPassword && !!editingEntity}
        step={field.type === 'number' ? '0.01' : undefined}
        {...register(field.name, field.type === 'number' ? { valueAsNumber: true } : {})}
        error={errors[field.name]?.message as string}
      />
    );
  };

  // Reset Password Modal state
  const [resetUser, setResetUser] = useState<{ id: string; name: string } | null>(null);
  const [resetPwd, setResetPwd] = useState('');
  const [resetPwd2, setResetPwd2] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (resetPwd.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (resetPwd !== resetPwd2) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsResetting(true);
  await ApiService.resetUserPassword(resetUser.id, resetPwd, resetPwd2);
      toast.success('Password reset successfully');
      setResetUser(null);
      setResetPwd('');
      setResetPwd2('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage {entityName}</h1>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingEntity ? `Edit ${entityName}` : `Add New ${entityName}`}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(renderField)}
            
            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3">
              {editingEntity ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={cancelEdit}
                    disabled={isSubmitting}
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="px-6"
                  >
                    Update {entityName}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearForm}
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="px-6"
                  >
                    <Plus size={16} className="mr-2" />
                    Add {entityName}
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{entityName} List</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${entityName.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm 
                  ? `No ${entityName.toLowerCase()} found matching "${searchTerm}".`
                  : `No ${entityName.toLowerCase()} found. Add one above.`
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {fields.map(field => (
                        <th
                          key={field.name}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {field.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEntities.map((entity) => (
                      <tr key={entity.id} className="hover:bg-gray-50">
                        {fields.map(field => (
                          <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {field.type === 'password' ? '••••••••' : 
                             field.name === 'username' && entity.userName ? entity.userName :
                             field.name === 'dateOfBirth' ? (entity.dateOfBirth || 'N/A') :
                             field.name === 'role' && field.options ? 
                               (field.options.find(opt => opt.value === entity.role)?.label || entity.role) :
                             (entity[field.name] || 'N/A')}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {entityType === 'user' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Reset Password"
                                onClick={() => setResetUser({ id: entity.id, name: entity.userName || entity.firstName || entity.id })}
                              >
                                <Key size={16} className="text-indigo-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(entity)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirm({ 
                                id: entity.id, 
                                name: entity.firstName ? `${entity.firstName} ${entity.lastName}` : 
                                      entity.name || entity.productCode || entity.code || entity.userName || entity.id 
                              })}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredEntities.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirm?.name}"? 
            This action cannot be undone.
          </p>
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        title={`Reset Password${resetUser ? ` for ${resetUser.name}` : ''}`}
      >
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={resetPwd}
            onChange={(e: any) => setResetPwd(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={resetPwd2}
            onChange={(e: any) => setResetPwd2(e.target.value)}
            required
          />
          <div className="flex space-x-3 justify-end">
            <Button variant="secondary" onClick={() => setResetUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}