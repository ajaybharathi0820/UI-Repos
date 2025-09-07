import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '../layout/Layout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ApiService from '../../services/api';
import type { User, Polisher, BagType, Product } from '../../types';

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
  validationSchema: any;
}

export function CrudPage({ entityType, entityName, fields, validationSchema }: CrudPageProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(validationSchema),
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
      toast.error(`Failed to load ${entityName.toLowerCase()}s`);
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
  }, [searchTerm, entities, fields]);

  useEffect(() => {
    loadEntities();
  }, [entityType]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
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
      toast.error(`Failed to save ${entityName.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entity: any) => {
    setEditingEntity(entity);
    fields.forEach(field => {
      let value = entity[field.name];
      
      // Handle special field mappings
      if (field.name === 'username' && entity.userName) {
        value = entity.userName;
      } else if (field.name === 'dateOfBirth' && entity.age) {
        // Calculate approximate birth year from age
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - entity.age;
        value = `${birthYear}-01-01`;
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
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
    }
  };

  const cancelEdit = () => {
    setEditingEntity(null);
    reset();
  };

  const renderField = (field: CrudField) => {
    if (field.type === 'select' && field.options) {
      return (
        <Select
          key={field.name}
          label={field.label}
          required={field.required}
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
        required={field.required}
        step={field.type === 'number' ? '0.01' : undefined}
        {...register(field.name, field.type === 'number' ? { valueAsNumber: true } : {})}
        error={errors[field.name]?.message as string}
      />
    );
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
            {editingEntity && (
              <Button variant="ghost" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(renderField)}
            
            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3">
              <Button
                type="submit"
                loading={isSubmitting}
                className="px-6"
              >
                <Plus size={16} className="mr-2" />
                {editingEntity ? 'Update' : 'Add'} {entityName}
              </Button>
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
                  {filteredEntities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      {fields.map(field => (
                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {field.type === 'password' ? '••••••••' : 
                           field.name === 'username' && entity.userName ? entity.userName :
                           field.name === 'dateOfBirth' && entity.age ? `Age: ${entity.age}` :
                           field.name === 'role' && field.options ? 
                             (field.options.find(opt => opt.value === entity.role)?.label || entity.role) :
                           (entity[field.name] || 'N/A')}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
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
    </Layout>
  );
}