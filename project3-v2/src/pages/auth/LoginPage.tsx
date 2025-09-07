import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import ApiService from '../../services/api';

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

interface LoginForm {
  username: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [expired, setExpired] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expiredParam = params.get('expired');
    const expiredFlag = localStorage.getItem('session_expired');
    if (expiredParam === '1' || expiredFlag === '1') {
      setExpired(true);
      localStorage.removeItem('session_expired');
    }
  }, [location.search]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      console.log('Attempting login with:', { username: data.username });
  const response = await ApiService.login(data);
  console.log('Login response:', response);

  // Store token immediately so subsequent calls include Authorization header
  localStorage.setItem('auth_token', response.token);

  // Fetch the complete user details using the username (now authenticated)
  const fullUser = await ApiService.getCurrentUser(response.userName);
      console.log('Full user details:', fullUser);
      
      login(fullUser, response.token);
      toast.success('Login successful!');
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">StockMate</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {expired && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                Session expired. Please sign in again.
              </div>
            )}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <Input
              label="Username"
              type="text"
              autoComplete="username"
              required
              {...register('username')}
              error={errors.username?.message}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Demo credentials: admin / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}