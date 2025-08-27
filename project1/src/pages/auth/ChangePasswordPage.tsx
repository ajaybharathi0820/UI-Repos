import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { Layout } from '../../components/layout/Layout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import ApiService from '../../services/api';

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    
    try {
      await ApiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      toast.success('Password changed successfully!');
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Change Password</h1>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                required
                {...register('currentPassword')}
                error={errors.currentPassword?.message}
              />

              <Input
                label="New Password"
                type="password"
                required
                {...register('newPassword')}
                error={errors.newPassword?.message}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  className="flex-1"
                >
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => reset()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}