import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Type definition for import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
    };
  }
}

export const policySchema = z.object({
  title: z.string().min(1, 'Policy name is required'),
  type: z.string().default('auto'),
  category: z.string().default('insurance'),
  provider: z.string().default(''),
  policyNumber: z.string().optional(),
  coverageAmount: z.string().optional(),
  deductible: z.string().optional(),
  premium: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export type PolicyFormData = z.infer<typeof policySchema>;

export const usePolicyForm = (onSuccess: () => void) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema) as any,
    mode: 'onChange',
    defaultValues: {
      title: '',
      type: 'auto',
      category: 'insurance',
      provider: '',
      policyNumber: '',
      coverageAmount: '',
      deductible: '',
      premium: '',
      startDate: '',
      endDate: '',
      notes: ''
    },
  });

  const ensureUserProfile = useCallback(async (userId: string, email: string): Promise<void> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profile) return;

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile check error:', profileError);
        throw new Error('Failed to check user profile');
      }

      const { error: createError } = await supabase.rpc('create_user_profile', {
        p_user_id: userId,
        user_email: email,
        user_full_name: email.split('@')[0]
      });

      if (createError) {
        console.error('Error creating profile:', createError);
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      throw error;
    }
  }, []);

  const uploadPolicyDocument = useCallback(async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('policy-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload file. Please try again.');
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('policy-documents')
      .getPublicUrl(uploadData.path);

    return {
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      fileType: file.type,
      storagePath: uploadData.path
    };
  }, []);

  const onSubmit = useCallback(async (formData: PolicyFormData & { files?: File[] }) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!formData.files || formData.files.length === 0) {
      setError('Please upload a policy document');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure user profile exists
      await ensureUserProfile(user.id, user.email || '');

      // Upload the policy document
      const file = formData.files[0];
      let documentUrl = '';
      let documentInfo: {
        fileName: string;
        fileUrl: string;
        fileSize: number;
        fileType: string;
        storagePath: string;
      } | null = null;

      try {
        documentInfo = await uploadPolicyDocument(file, user.id);
        documentUrl = documentInfo.fileUrl;
      } catch (uploadError) {
        console.error('Error uploading document:', uploadError);
        throw new Error('Failed to upload policy document. Please try again.');
      }

      // Create policy record with the document URL
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          type: formData.type,
          category: formData.category,
          provider: formData.provider,
          policy_number: formData.policyNumber,
          coverage_amount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : null,
          deductible: formData.deductible ? parseFloat(formData.deductible) : null,
          premium: formData.premium ? parseFloat(formData.premium) : null,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          status: 'active',
          document_url: documentUrl,
          file_name: documentInfo.fileName,
          file_size: documentInfo.fileSize,
          file_type: documentInfo.fileType,
          notes: formData.notes
        })
        .select()
        .single();

      if (policyError) {
        // Clean up the uploaded file if policy creation fails
        if (documentInfo?.storagePath) {
          await supabase.storage
            .from('policy-documents')
            .remove([documentInfo.storagePath]);
        }
        throw policyError;
      }

      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error creating policy:', error);
      setError(error instanceof Error ? error.message : 'Failed to create policy. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, form, onSuccess, ensureUserProfile, uploadPolicyDocument]);

  return {
    form,
    isSubmitting,
    error,
    onSubmit: form.handleSubmit(onSubmit as any),
  };
};
