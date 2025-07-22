import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { PolicyFormFields } from '../policy/PolicyFormFields';
import { usePolicyForm } from '../../hooks/usePolicyForm';

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
];

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  
  const {
    form,
    error,
    isSubmitting,
    onSubmit,
  } = usePolicyForm(onSuccess);

  const handleFileSelect = (files: File[]) => {
    setUploadedFiles(files);
    setFileErrors([]);
  };

  const handleSubmit = async (data: any) => {
    try {
      // Here you would typically handle file uploads before form submission
      // For now, we'll just pass the files along with the form data
      await onSubmit({ ...data, files: uploadedFiles });
      setUploadedFiles([]);
      setFileErrors([]);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
              onClick={onClose} 
              aria-hidden="true"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium leading-6 text-gray-900">
                    Add New Policy
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill in the details below to add a new insurance policy or warranty.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Policy Documents
                      </label>
                      <FileUpload
                        accept="application/pdf,image/jpeg,image/png"
                        maxSize={10}
                        onFileSelect={handleFileSelect}
                        multiple
                      />
                      <p className="text-xs text-gray-500">
                        Upload PDF, JPG, or PNG files (max 10MB)
                      </p>
                      {fileErrors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          {fileErrors.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>

                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <PolicyFormFields form={form} policyTypes={policyTypes} />

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    {form.formState.errors.root && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {form.formState.errors.root.message as string}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !form.formState.isValid}
                        loading={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Policy'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};