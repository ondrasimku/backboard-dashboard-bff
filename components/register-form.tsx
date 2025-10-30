'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

type FieldErrors = Partial<Record<keyof RegisterFormData, string>>;
type TouchedFields = Partial<Record<keyof RegisterFormData, boolean>>;

export const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  
  // Controlled form state
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const validateField = (fieldName: keyof RegisterFormData, value: string | boolean) => {
    const dataToValidate = { ...formData, [fieldName]: value };
    
    try {
      if (fieldName === 'confirmPassword') {
        // For confirmPassword, validate the field itself and check password match
        registerSchema.shape.confirmPassword.parse(value);
        
        if (dataToValidate.password && value && dataToValidate.password !== value) {
          setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
          return false;
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
          return true;
        }
      } else if (fieldName === 'terms') {
        registerSchema.shape.terms.parse(value);
      } else {
        registerSchema.shape[fieldName].parse(value);
      }
      
      // Clear error if validation passes
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

  const handleBlur = (fieldName: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const handleChange = (fieldName: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate on change if field has been touched
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
    
    // Special handling: when password changes, revalidate confirmPassword if touched
    if (fieldName === 'password' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Client-side validation
      const validationResult = registerSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: FieldErrors = {};
        validationResult.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof RegisterFormData;
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors in the form');
        return;
      }

      // Call user service API
      const result = await userServiceApiClient.register({
        email: validationResult.data.email,
        password: validationResult.data.password,
        firstName: validationResult.data.firstName,
        lastName: validationResult.data.lastName,
      });

      // Success - store token and redirect
      localStorage.setItem('authToken', result.token);
      toast.success('Account created successfully!');
      
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        // Handle validation errors from the API
        if (error.validationErrors) {
          setErrors(error.validationErrors as FieldErrors);
          toast.error('Please fix the errors in the form');
        } else {
          toast.error(error.message);
        }
      } else {
        console.error('Registration error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Fields Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* First Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            First name
          </label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            className="w-full"
            autoComplete="given-name"
            disabled={isLoading}
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-sm text-destructive">
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Last name
          </label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            className="w-full"
            autoComplete="family-name"
            disabled={isLoading}
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-sm text-destructive">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

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
        <label
          htmlFor="password"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full"
          autoComplete="new-password"
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Confirm password
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

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-start space-x-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            disabled={isLoading}
            checked={formData.terms}
            onChange={(e) => {
              setTouched(prev => ({ ...prev, terms: true }));
              handleChange('terms', e.target.checked);
            }}
            aria-invalid={!!errors.terms}
            aria-describedby={errors.terms ? 'terms-error' : undefined}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-relaxed"
          >
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.terms && (
          <p id="terms-error" className="text-sm text-destructive">
            {errors.terms}
          </p>
        )}
      </div>

      {/* Sign Up Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};


