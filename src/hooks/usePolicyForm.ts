import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
});

export type PolicyFormData = z.infer<typeof policySchema>;

export const usePolicyForm = (onSuccess: () => void) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PolicyFormData>({
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

  const uploadFile = useCallback(async (file: File, policyId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${policyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Debug logging
      console.log('Uploading file to Supabase Storage:', {
        bucket: 'policy-documents',
        path: fileName,
        fileSize: file.size,
        fileType: file.type,
        policyId,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        anonKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
      });

      const { data, error } = await supabase.storage
        .from('policy-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }, []);

  const onSubmit = useCallback(async (formData: PolicyFormData & { files?: File[] }) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure user profile exists
      await ensureUserProfile(user.id, user.email || '');

      // Create policy record
      const policyData = {
        user_id: user.id,
        title: formData.title.trim(),
        type: formData.type,
        provider: formData.provider.trim(),
        policy_number: formData.policy_number?.trim() || null,
        coverage_amount: formData.coverage_amount ? parseFloat(formData.coverage_amount) : null,
        deductible: formData.deductible ? parseFloat(formData.deductible) : null,
        premium: formData.premium ? parseFloat(formData.premium) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        notes: formData.notes?.trim() || null,
        status: 'active',
      };

      // Create the policy first
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert(policyData)
        .select()
        .single();

      if (policyError) {
        throw policyError;
      }

      // Handle file uploads if any
      if (formData.files && formData.files.length > 0) {
        const uploadPromises = formData.files.map(file => 
          uploadFile(file, policy.id)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        const documentUrls = uploadResults.filter((url): url is string => url !== null);
        
        // Update policy with document URLs if needed
        if (documentUrls.length > 0) {
          await supabase
            .from('policies')
            .update({ document_urls: documentUrls })
            .eq('id', policy.id);
        }
      }

      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error creating policy:', error);
      setError('Failed to create policy. Please try again.');
      throw error; // Re-throw to allow handling in the component
    } finally {
      setIsSubmitting(false);
    }
  }, [user, form, onSuccess, ensureUserProfile, uploadFile]);

  return {
    form,
    isSubmitting,
    error,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
