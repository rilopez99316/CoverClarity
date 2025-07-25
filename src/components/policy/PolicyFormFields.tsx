import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '../ui/Input';

type PolicyFormFieldsProps = {
  form: UseFormReturn<any>;
};

export const PolicyFormFields: React.FC<PolicyFormFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Input
          label="Policy Name"
          placeholder="e.g., My Car Insurance"
          {...form.register('title', { required: 'Name is required' })}
          error={form.formState.errors.title?.message as string | undefined}
          autoFocus
        />
      </div>
    </div>
  );
};
