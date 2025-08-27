import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '../layout/Layout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ApiService from '../../services/api';

interface CrudField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'email';
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
      // Mock data for demo
      const mockData = generateMockData(entityType);
      setEntities(mockData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntities();
  }, [entityType]);

  const generateMockData = (type: string) => {
    const baseData = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (type) {
      case 'polisher':
        return [
          { ...baseData, id: '1', name: 'Auto Polisher 1', code: 'AP-001', status: 'active' },
          { ...baseData, id: '2', name: 'Manual Polisher 1', code: 'MP-001', status: 'inactive' },
        ];
      case 'user':
        return [
          { ...baseData, id: '1', name: 'John Doe', email: 'john@stockmate.com', role: 'admin' },
          { ...baseData, id: '2', name: 'Jane Smith', email: 'jane@stockmate.com', role: 'user' },
        ];
      case 'bag-type':
        return [
          { ...baseData, id: '1', name: 'Small Bag', code: 'SB', expectedWeight: 5.0, tolerance: 0.2 },
          { ...baseData, id: '2', name: 'Medium Bag', code: 'MB', expectedWeight: 10.0, tolerance: 0.3 },
        ];
      case 'items':
        return [
          { ...baseData, id: '1', name: 'Widget A', code: 'WA-001', category: 'Electronics' },
          { ...baseData, id: '2', name: 'Component B', code: 'CB-002', category: 'Mechanical' },
        ];
      default:
        return [];
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const newEntity = {
        ...data,
        id: editingEntity ? editingEntity.id : Date.now().toString(),
        createdAt: editingEntity ? editingEntity.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingEntity) {
        setEntities(prev => prev.map(entity => 
          entity.id === editingEntity.id ? newEntity : entity
        ));
        toast.success(`${entityName} updated successfully!`);
        setEditingEntity(null);
      } else {
        setEntities(prev => [newEntity, ...prev]);
        toast.success(`${entityName} created successfully!`);
      }

      reset();
    } catch (error) {
      toast.error(`Failed to save ${entityName.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entity: any) => {
    setEditingEntity(entity);
    fields.forEach(field => {
      setValue(field.name, entity[field.name] || '');
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setEntities(prev => prev.filter(entity => entity.id !== id));
      toast.success(`${entityName} deleted successfully!`);
      setDeleteConfirm(null);
    } catch (error) {
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
            <h3 className="text-lg font-semibold text-gray-900">{entityName} List</h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : entities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No {entityName.toLowerCase()} found. Add one above.</p>
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
                  {entities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      {fields.map(field => (
                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entity[field.name] || 'N/A'}
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
                              name: entity.name || entity.code || entity.id 
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