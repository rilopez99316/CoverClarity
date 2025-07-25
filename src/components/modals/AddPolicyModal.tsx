import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { PolicyFormFields } from '../policy/PolicyFormFields';
import { usePolicyForm } from '../../hooks/usePolicyForm';

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

  const handleSubmit = async (formData: any) => {
    if (uploadedFiles.length === 0) {
      setFileErrors(['Please upload a policy document']);
      return;
    }

    try {
      // Combine form data with uploaded files
      await onSubmit({ ...formData, files: uploadedFiles });
      // onSuccess will be called by usePolicyForm on successful submission
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error is already handled by usePolicyForm
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

                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <PolicyFormFields form={form} />
                      {error && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">
                                Error saving policy
                              </h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Policy Document
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <FileUpload
                          accept="application/pdf,image/jpeg,image/png"
                          maxSize={10}
                          onFileSelect={handleFileSelect}
                          error={fileErrors[0]} // Show first error if any
                          required
                        />
                        {fileErrors.length > 0 && (
                          <p className="mt-1 text-sm text-red-600">
                            {fileErrors[0]}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Upload a PDF or image of your policy document (max 10MB)
                        </p>
                      </div>
                    </div>

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
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        className="justify-center"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Policy'}
                      </Button>
                    </div>
                  </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};