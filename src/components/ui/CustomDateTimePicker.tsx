'use client';
import { useId, useState } from 'react';
import { Popover } from 'radix-ui';
import { CalendarBlank, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import CustomDropdown from './CustomDropdown';
import { cn } from '@/lib/utils';
import './admin-controls.css';

interface CustomDateTimePickerProps {
  value: Date;
  onChange: (value: Date) => void;
  label?: string;
  className?: string;
  popoverDirection?: 'top' | 'bottom' | 'left' | 'right';
  dateOnly?: boolean;
  empty?: boolean;
  onClear?: () => void;
}

export default function CustomDateTimePicker({ value, onChange, label, className, popoverDirection = 'bottom', dateOnly = false, empty = false, onClear }: CustomDateTimePickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const valid = !Number.isNaN(value.getTime());
  const [month, setMonth] = useState(() => valid ? value.getMonth() : new Date().getMonth());
  const [year, setYear] = useState(() => valid ? value.getFullYear() : new Date().getFullYear());
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const chooseDay = (day: number) => {
    const next = valid ? new Date(value) : new Date();
    next.setFullYear(year, month, day);
    onChange(next);
    if (dateOnly) setOpen(false);
  };
  const changeTime = (part: 'hour' | 'minute', number: string) => {
    const next = valid ? new Date(value) : new Date();
    if (part === 'hour') next.setHours(Number(number)); else next.setMinutes(Number(number));
    next.setSeconds(0, 0); onChange(next);
  };
  const moveMonth = (step: number) => { const next = new Date(year, month + step, 1); setMonth(next.getMonth()); setYear(next.getFullYear()); };
  return <div className={cn('admin-date-field', className)}>
    {label && <label htmlFor={id}>{label}</label>}
    <Popover.Root open={open} onOpenChange={next => { if (next && valid) { setMonth(value.getMonth()); setYear(value.getFullYear()); } setOpen(next); }}>
      <Popover.Trigger id={id} className="admin-date-trigger" aria-label={label || (dateOnly ? 'Choose date' : 'Choose date and time')}>
        <span>{valid && !empty ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(dateOnly ? {} : { hour: '2-digit', minute: '2-digit' }) }) : 'Choose date'}</span><CalendarBlank size={18} />
      </Popover.Trigger>
      <Popover.Portal><Popover.Content className="admin-calendar-popover" side={popoverDirection} sideOffset={6} collisionPadding={12} data-admin-floating="true" aria-label={dateOnly ? 'Choose date' : 'Choose date and time'}>
        <div className="admin-calendar-nav">
          <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}><CaretLeft size={17} /></button>
          <CustomDropdown placeholder="Month" value={String(month)} onChange={value => setMonth(Number(value))} options={Array.from({ length: 12 }, (_, i) => ({ label: new Date(2026, i, 1).toLocaleDateString('en-GB', { month: 'long' }), value: String(i) }))} />
          <CustomDropdown placeholder="Year" value={String(year)} onChange={value => setYear(Number(value))} options={Array.from({ length: 201 }, (_, i) => ({ label: String(1900 + i), value: String(1900 + i) }))} />
          <button type="button" aria-label="Next month" onClick={() => moveMonth(1)}><CaretRight size={17} /></button>
        </div>
        <div className="admin-calendar-week" aria-hidden="true">{['Mo','Tu','We','Th','Fr','Sa','Su'].map(day => <span key={day}>{day}</span>)}</div>
        <div className="admin-calendar-days">
          {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
          {Array.from({ length: days }, (_, i) => i + 1).map(day => <button key={day} type="button" aria-label={new Date(year, month, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} aria-pressed={!empty && valid && value.getDate() === day && value.getMonth() === month && value.getFullYear() === year} onClick={() => chooseDay(day)}>{day}</button>)}
        </div>
        {!dateOnly && <div className="admin-calendar-time"><span>Time</span>
          <CustomDropdown placeholder="Hour" value={String(valid ? value.getHours() : 0)} onChange={v => changeTime('hour', v)} options={Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: String(i) }))} />
          <span>:</span><CustomDropdown placeholder="Minute" value={String(valid ? value.getMinutes() : 0)} onChange={v => changeTime('minute', v)} options={Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: String(i) }))} />
        </div>}
        <div className="admin-calendar-footer">
          <button type="button" onClick={() => { const today = new Date(); setMonth(today.getMonth()); setYear(today.getFullYear()); onChange(today); if (dateOnly) setOpen(false); }}>Today</button>
          {onClear && <button type="button" onClick={() => { onClear(); setOpen(false); }}>Clear</button>}
          <Popover.Close aria-label="Close date picker"><X size={14} /> Done</Popover.Close>
        </div>
      </Popover.Content></Popover.Portal>
    </Popover.Root>
  </div>;
}

export function CustomDatePicker({ value, onChange, label, className }: { value: string; onChange: (value: string) => void; label: string; className?: string }) {
  return <CustomDateTimePicker value={value ? new Date(`${value}T12:00:00`) : new Date()} empty={!value} onChange={date => onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)} onClear={() => onChange('')} label={label} className={className} dateOnly />;
}
