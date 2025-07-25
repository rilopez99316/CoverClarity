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
  title: z.string().min(1, 'Policy name is required'),
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
      title: ''
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

    if (!formData.files || formData.files.length === 0) {
      setError('Please upload a policy document');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure user profile exists
      await ensureUserProfile(user.id, user.email || '');

      // First, upload the file to storage
      const file = formData.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `temp/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
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
        .getPublicUrl(fileName);

      // Create policy record with the document URL
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          status: 'active',
          document_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (policyError) {
        // Clean up the uploaded file if policy creation fails
        await supabase.storage
          .from('policy-documents')
          .remove([fileName]);
          
        throw policyError;
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
