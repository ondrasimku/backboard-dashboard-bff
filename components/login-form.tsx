'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { bffAuthClient, BffApiError } from '@/lib/clients/bff-auth-client';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type FieldErrors = Partial<Record<keyof LoginFormData, string>>;
type TouchedFields = Partial<Record<keyof LoginFormData, boolean>>;

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const validateField = (fieldName: keyof LoginFormData, value: string) => {
    try {
      loginSchema.shape[fieldName].parse(value);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: error.issues[0]?.message || 'Invalid value',
        }));
      }
      return false;
    }
  };

  const handleBlur = (fieldName: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const handleChange = (fieldName: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validationResult = loginSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: FieldErrors = {};
        validationResult.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof LoginFormData;
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
        return;
      }

      const result = await bffAuthClient.login({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      toast.success('Login successful!');
      
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      if (error instanceof BffApiError) {
        if (error.validationErrors) {
          setErrors(error.validationErrors as FieldErrors);
          toast.error('Please fix the errors in the form');
        } else {
          toast.error(error.message);
        }
      } else {
        console.error('Login error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full"
          autoComplete="email"
          disabled={isLoading}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full"
          autoComplete="current-password"
          disabled={isLoading}
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      {/* Sign In Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};


