'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { bffAuthClient, BffApiError } from '@/lib/clients/bff-auth-client';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

type FieldErrors = Partial<Record<keyof ForgotPasswordFormData, string>>;
type TouchedFields = Partial<Record<keyof ForgotPasswordFormData, boolean>>;

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const validateField = (fieldName: keyof ForgotPasswordFormData, value: string) => {
    try {
      forgotPasswordSchema.shape[fieldName].parse(value);
      
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

  const handleBlur = (fieldName: keyof ForgotPasswordFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const handleChange = (fieldName: keyof ForgotPasswordFormData, value: string) => {
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
      const validationResult = forgotPasswordSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: FieldErrors = {};
        validationResult.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof ForgotPasswordFormData;
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
        return;
      }

      const result = await bffAuthClient.passwordResetRequest({
        email: validationResult.data.email,
      });

      setIsSuccess(true);
      toast.success(result.message);
    } catch (error) {
      if (error instanceof BffApiError) {
        if (error.validationErrors) {
          setErrors(error.validationErrors as FieldErrors);
          toast.error('Please fix the errors in the form');
        } else {
          toast.error(error.message);
        }
      } else {
        console.error('Forgot password error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            If the email exists in our system, a password reset link has been sent to your email address.
            Please check your inbox and follow the instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  );
};

