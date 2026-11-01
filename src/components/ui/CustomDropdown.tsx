'use client';
import { useId } from 'react';
import { Select } from 'radix-ui';
import { CaretDown, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import './admin-controls.css';

interface Option { label: string; value: string; }
interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({ options, value, onChange, label, placeholder = 'Select an option...', className }: CustomDropdownProps) {
  const id = useId();
  const selected = options.findIndex(option => option.value === value);
  return <div className={cn('admin-select-field', className)}>
    {label && <label htmlFor={id}>{label}</label>}
    <Select.Root value={selected < 0 ? '' : String(selected)} onValueChange={key => { const option = options[Number(key)]; if (option) onChange(option.value); }}>
      <Select.Trigger id={id} className="admin-select-trigger" aria-label={label || placeholder}>
        <Select.Value placeholder={placeholder} /><Select.Icon><CaretDown size={16} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="admin-select-menu" position="popper" sideOffset={6} collisionPadding={12} data-admin-floating="true">
          <Select.ScrollUpButton className="admin-select-scroll"><CaretDown size={14} style={{ transform: 'rotate(180deg)' }} /></Select.ScrollUpButton>
          <Select.Viewport className="admin-select-options">
            {options.map((option, index) => <Select.Item key={option.value} value={String(index)} className="admin-select-option">
              <Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator><Check size={16} weight="bold" /></Select.ItemIndicator>
            </Select.Item>)}
            {!options.length && <div className="admin-select-empty">No options available</div>}
          </Select.Viewport>
          <Select.ScrollDownButton className="admin-select-scroll"><CaretDown size={14} /></Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>;
}
