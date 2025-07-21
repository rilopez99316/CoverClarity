import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Upload, Calendar, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { FileUpload } from '../ui/FileUpload'

const policySchema = z.object({
  title: z.string().min(1, 'Policy title is required'),
  type: z.string().min(1, 'Policy type is required'),
  provider: z.string().min(1, 'Provider is required'),
  policy_number: z.string().optional(),
  coverage_amount: z.string().optional(),
  deductible: z.string().optional(),
  premium: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
})

type PolicyForm = z.infer<typeof policySchema>

interface AddPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const policyTypes = [
  'Auto Insurance',
  'Home Insurance',
  'Renters Insurance',
  'Health Insurance',
  'Life Insurance',
  'Phone Warranty',
  'Electronics Warranty',
  'Appliance Warranty',
  'Extended Warranty',
  'Other'
]

export const AddPolicyModal: React.FC<AddPolicyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const form = useForm<PolicyForm>({
    resolver: zodResolver(policySchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      type: '',
      provider: '',
      policy_number: '',
      coverage_amount: '',
      deductible: '',
      premium: '',
      start_date: '',
      end_date: '',
      notes: '',
    }
  });
  
  // Debug form state changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form field changed:', { name, type, value });
      console.log('Form errors:', form.formState.errors);
      console.log('Is form valid?', form.formState.isValid);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const uploadFile = async (file: File, policyId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${policyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

      const { data, error } = await supabase.storage
        .from('policy-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        return null
      }

      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('File upload failed:', error)
      return null
    }
  }

  const onSubmit = async (data: PolicyForm) => {
    console.log('Form submission started with data:', data);
    console.log('User:', user);
    console.log('Uploaded files:', uploadedFiles);
    if (!user) return

    setLoading(true)
    try {
      // Create policy record
      const policyData = {
        user_id: user.id,
        title: data.title,
        type: data.type,
        provider: data.provider,
        policy_number: data.policy_number || null,
        coverage_amount: data.coverage_amount ? parseFloat(data.coverage_amount) : null,
        deductible: data.deductible ? parseFloat(data.deductible) : null,
        premium: data.premium ? parseFloat(data.premium) : null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        notes: data.notes || null,
        status: 'active'
      }

      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert(policyData)
        .select()
        .single()

      if (policyError) {
        throw policyError
      }

      // Upload files if any
      if (uploadedFiles.length > 0) {
        const uploadPromises = uploadedFiles.map(file => uploadFile(file, policy.id))
        const uploadResults = await Promise.all(uploadPromises)
        
        // Update policy with document URLs
        const documentUrls = uploadResults.filter(url => url !== null)
        if (documentUrls.length > 0) {
          await supabase
            .from('policies')
            .update({ document_url: documentUrls[0] }) // For now, store first document URL
            .eq('id', policy.id)
        }
      }

      form.reset()
      setUploadedFiles([])
      setUploadProgress({})
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating policy:', error)
      form.setError('root', {
        message: 'Failed to create policy. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  // Debug form state
  console.log('Form state:', {
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty
  });

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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Policy</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                console.log('Form submit triggered');
                const isValid = await form.trigger();
                console.log('Form validation result:', isValid);
                console.log('Form errors:', form.formState.errors);
                
                if (isValid) {
                  console.log('Form is valid, submitting...');
                  form.handleSubmit(onSubmit)();
                } else {
                  console.log('Form is invalid');
                }
              }} 
              className="p-6 space-y-6" 
              noValidate
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Policy Title"
                  placeholder="e.g., State Farm Auto Insurance"
                  {...form.register('title', { required: 'Policy title is required' })}
                  error={form.formState.errors.title?.message}
                />
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Policy Type
                  </label>
                  <select
                    {...form.register('type')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select policy type</option>
                    {policyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Provider"
                  placeholder="e.g., State Farm, Geico, Apple"
                  {...form.register('provider', { required: 'Provider is required' })}
                  error={form.formState.errors.provider?.message}
                />
                
                <Input
                  label="Policy Number (Optional)"
                  placeholder="Policy or warranty number"
                  {...form.register('policy_number')}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Coverage Amount (Optional)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  icon={<DollarSign size={20} />}
                  {...form.register('coverage_amount')}
                />
                
                <Input
                  label="Deductible (Optional)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  icon={<DollarSign size={20} />}
                  {...form.register('deductible')}
                />
                
                <Input
                  label="Monthly Premium (Optional)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  icon={<DollarSign size={20} />}
                  {...form.register('premium')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Start Date (Optional)"
                  type="date"
                  icon={<Calendar size={20} />}
                  {...form.register('start_date')}
                />
                
                <Input
                  label="End Date (Optional)"
                  type="date"
                  icon={<Calendar size={20} />}
                  {...form.register('end_date')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  {...form.register('notes')}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Additional notes about this policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Documents (Optional)
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple={true}
                  maxSize={10}
                />
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{fileName}</span>
                        <span className="text-gray-500">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.formState.errors.root && (
                <p className="text-red-600 text-sm text-center">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex items-center space-x-2"
                  disabled={!form.formState.isValid || loading}
                >
                  <Shield size={16} />
                  <span>Add Policy</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}