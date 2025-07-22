import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '../ui/Input';
import { DollarSign, Calendar as CalendarIcon } from 'lucide-react';

type PolicyFormFieldsProps = {
  form: UseFormReturn<any>;
  policyTypes: string[];
};

export const PolicyFormFields: React.FC<PolicyFormFieldsProps> = ({ form, policyTypes }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Input
          label="Policy Title"
          placeholder="e.g., My Car Insurance"
          {...form.register('title', { required: 'Title is required' })}
          error={form.formState.errors.title?.message}
          autoFocus
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...form.register('type', { required: 'Type is required' })}
            >
              <option value="">Select a type</option>
              {policyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {form.formState.errors.type && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.type.message as string}
              </p>
            )}
          </div>
          
          <Input
            label="Provider"
            placeholder="e.g., Geico, State Farm"
            {...form.register('provider', { required: 'Provider is required' })}
            error={form.formState.errors.provider?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Policy Number (Optional)"
            placeholder="Policy or warranty number"
            {...form.register('policy_number')}
          />
          
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Premium (Optional)"
            type="number"
            step="0.01"
            placeholder="0.00"
            icon={<DollarSign size={20} />}
            {...form.register('premium')}
          />
          
          <Input
            label="Start Date (Optional)"
            type="date"
            icon={<CalendarIcon size={20} />}
            {...form.register('start_date')}
          />
          
          <Input
            label="End Date (Optional)"
            type="date"
            icon={<CalendarIcon size={20} />}
            {...form.register('end_date')}
          />
        </div>
      </div>
    </div>
  );
};
