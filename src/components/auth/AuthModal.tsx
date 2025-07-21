import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = z.infer<typeof signUpSchema>

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  const handleSignIn = async (data: SignInForm) => {
    setLoading(true);
    
    // Debug: Log the form data and form state
    console.log('Sign in data:', data);
    console.log('Form values:', signInForm.getValues());
    console.log('Form errors:', signInForm.formState.errors);
    
    // Validate that email and password exist before proceeding
    if (!data.email || !data.password) {
      console.log('Missing required fields - email:', data.email, 'password:', data.password);
      signInForm.setError('root', {
        message: 'Please provide both email and password'
      });
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await signIn(data.email.trim(), data.password);
      
      if (error) {
        console.error('Sign in error:', error);
        signInForm.setError('root', { 
          message: error.message || 'Failed to sign in. Please check your credentials.' 
        });
      } else {
        signInForm.reset();
        onClose();
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error)
      signInForm.setError('root', { 
        message: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }
    
  const handleSignUp = async (data: SignUpForm) => {
    setLoading(true);
    
    // Debug: Log the form data and form state
    console.log('Sign up data:', data);
    console.log('Form values:', signUpForm.getValues());
    console.log('Form errors:', signUpForm.formState.errors);
    
    // Validate all required fields before proceeding
    if (!data.email || !data.password || !data.fullName || !data.confirmPassword) {
      console.log('Missing required fields - email:', data.email, 'password:', data.password, 'fullName:', data.fullName, 'confirmPassword:', data.confirmPassword);
      signUpForm.setError('root', {
        message: 'Please fill in all required fields'
      });
      setLoading(false);
      return;
    }
    
    // Ensure passwords match (though this is also handled by the schema)
    if (data.password !== data.confirmPassword) {
      signUpForm.setError('confirmPassword', {
        message: 'Passwords do not match'
      });
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await signUp(data.email.trim(), data.password, data.fullName.trim());
      
      if (error) {
        console.error('Sign up error:', error);
        signUpForm.setError('root', { 
          message: error.message || 'Failed to create account. Please try again.' 
        });
      } else {
        signUpForm.reset();
        onClose();
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error)
      signUpForm.setError('root', { 
        message: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }
    
  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setLoading(false)
    signInForm.reset()
    signUpForm.reset()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp 
                  ? 'Start protecting what matters most' 
                  : 'Sign in to your CoverClarity account'
                }
              </p>
            </div>

            {isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <Input
                  label="Full Name"
                  icon={<User size={20} />}
                  {...signUpForm.register('fullName', { required: 'Full name is required' })}
                  error={signUpForm.formState.errors.fullName?.message}
                  value={signUpForm.watch('fullName') || ''}
                  onChange={(e) => signUpForm.setValue('fullName', e.target.value, { shouldValidate: true })}
                  onBlur={() => signUpForm.trigger('fullName')}
                />
                <Input
                  label="Email"
                  type="email"
                  icon={<Mail size={20} />}
                  {...signUpForm.register('email', { required: 'Email is required' })}
                  error={signUpForm.formState.errors.email?.message}
                  value={signUpForm.watch('email') || ''}
                  onChange={(e) => signUpForm.setValue('email', e.target.value, { shouldValidate: true })}
                  onBlur={() => signUpForm.trigger('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  icon={<Lock size={20} />}
                  {...signUpForm.register('password', { required: 'Password is required' })}
                  error={signUpForm.formState.errors.password?.message}
                  value={signUpForm.watch('password') || ''}
                  onChange={(e) => signUpForm.setValue('password', e.target.value, { shouldValidate: true })}
                  onBlur={() => signUpForm.trigger('password')}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={<Lock size={20} />}
                  {...signUpForm.register('confirmPassword', { required: 'Please confirm your password' })}
                  error={signUpForm.formState.errors.confirmPassword?.message}
                  value={signUpForm.watch('confirmPassword') || ''}
                  onChange={(e) => signUpForm.setValue('confirmPassword', e.target.value, { shouldValidate: true })}
                  onBlur={() => signUpForm.trigger('confirmPassword')}
                />
                
                {signUpForm.formState.errors.root && (
                  <p className="text-red-600 text-sm text-center">
                    {signUpForm.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Create Account
                </Button>
              </form>
            ) : (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  icon={<Mail size={20} />}
                  {...signInForm.register('email', { required: 'Email is required' })}
                  error={signInForm.formState.errors.email?.message}
                  value={signInForm.watch('email') || ''}
                  onChange={(e) => signInForm.setValue('email', e.target.value, { shouldValidate: true })}
                  onBlur={() => signInForm.trigger('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  icon={<Lock size={20} />}
                  {...signInForm.register('password', { required: 'Password is required' })}
                  error={signInForm.formState.errors.password?.message}
                  value={signInForm.watch('password') || ''}
                  onChange={(e) => signInForm.setValue('password', e.target.value, { shouldValidate: true })}
                  onBlur={() => signInForm.trigger('password')}
                />
                
                {signInForm.formState.errors.root && (
                  <p className="text-red-600 text-sm text-center">
                    {signInForm.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Sign In
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}