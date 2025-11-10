'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { bffAuthClient, BffApiError } from '@/lib/clients/bff-auth-client';
import { useRouter } from '@/i18n/navigation';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type FieldErrors = Partial<Record<keyof ResetPasswordFormData, string>>;
type TouchedFields = Partial<Record<keyof ResetPasswordFormData, boolean>>;

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });

  const validateField = (fieldName: keyof ResetPasswordFormData, value: string) => {
    try {
      if (fieldName === 'newPassword') {
        resetPasswordSchema.shape[fieldName].parse(value);
      } else if (fieldName === 'confirmPassword') {
        const isMatch = value === formData.newPassword;
        if (!isMatch) {
          throw new z.ZodError([{
            code: 'custom',
            path: [fieldName],
            message: "Passwords don't match",
          }]);
        }
      }
      
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

  const handleBlur = (fieldName: keyof ResetPasswordFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const handleChange = (fieldName: keyof ResetPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
    
    if (fieldName === 'newPassword' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validationResult = resetPasswordSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: FieldErrors = {};
        validationResult.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof ResetPasswordFormData;
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
        return;
      }

      const result = await bffAuthClient.passwordResetReset({
        token,
        newPassword: validationResult.data.newPassword,
      });

      toast.success(result.message);
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      if (error instanceof BffApiError) {
        if (error.validationErrors) {
          setErrors(error.validationErrors as FieldErrors);
          toast.error('Please fix the errors in the form');
        } else {
          toast.error(error.message);
        }
      } else {
        console.error('Reset password error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          New Password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          className="w-full"
          autoComplete="new-password"
          disabled={isLoading}
          value={formData.newPassword}
          onChange={(e) => handleChange('newPassword', e.target.value)}
          onBlur={() => handleBlur('newPassword')}
          aria-invalid={!!errors.newPassword}
          aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
        />
        {errors.newPassword && (
          <p id="newPassword-error" className="text-sm text-destructive">
            {errors.newPassword}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="w-full"
          autoComplete="new-password"
          disabled={isLoading}
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Resetting password...' : 'Reset password'}
      </Button>
    </form>
  );
};

