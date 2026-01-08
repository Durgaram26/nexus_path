import * as React from 'react';

import api from '@/lib/api';
import { toast } from 'sonner';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ checked, onCheckedChange, className = '', ...props }, ref) => {
		function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
			onCheckedChange?.(e.target.checked);
		}

		return (
			<input
				type="checkbox"
				ref={ref}
				className={`h-4 w-4 rounded border border-gray-300 text-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${className}`}
				checked={checked}
				onChange={handleChange}
				{...props}
			/>
		);
	}
);

Checkbox.displayName = 'Checkbox';
