'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarBlank, CaretDown, CaretLeft, CaretRight, CaretUp, Clock } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CustomDateTimePickerProps {
  value: Date;
  onChange: (value: Date) => void;
  label?: string;
  className?: string;
  popoverDirection?: 'top' | 'bottom' | 'left' | 'right';
}

export default function CustomDateTimePicker({
  value,
  onChange,
  label,
  className,
  popoverDirection = 'right'
}: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 639px)');
  const effectiveDirection = isMobile ? 'bottom' : popoverDirection;
  
  // Internal date logic states
  const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const [tempHours, setTempHours] = useState(() => {
    const hrs = value.getHours();
    if (hrs === 0) return 12;
    if (hrs > 12) return hrs - 12;
    return hrs;
  });
  const [tempMinutes, setTempMinutes] = useState(value.getMinutes());
  const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>(value.getHours() >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    const hrs = value.getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTempHours(hrs === 0 ? 12 : hrs > 12 ? hrs - 12 : hrs);
    setTempMinutes(value.getMinutes());
    setTempAmPm(hrs >= 12 ? 'PM' : 'AM');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate 42 calendar grid days
  const getCalendarDays = () => {
    const days: Array<{ day: number; month: 'prev' | 'current' | 'next'; date: Date }> = [];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: 'prev',
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthDays - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: 'current',
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: 'next',
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i)
      });
    }

    return days;
  };

  const updateTime = (h: number, m: number, ampm: 'AM' | 'PM', baseDate: Date) => {
    let finalHours = h;
    if (ampm === 'PM' && finalHours < 12) finalHours += 12;
    if (ampm === 'AM' && finalHours === 12) finalHours = 0;
    
    const nextDate = new Date(baseDate.getTime());
    nextDate.setHours(finalHours);
    nextDate.setMinutes(m);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    onChange(nextDate);
  };

  const handleSelectDay = (dayDate: Date) => {
    updateTime(tempHours, tempMinutes, tempAmPm, dayDate);
  };

  const handleHourChange = (increment: boolean) => {
    let nextH = tempHours + (increment ? 1 : -1);
    if (nextH > 12) nextH = 1;
    if (nextH < 1) nextH = 12;
    setTempHours(nextH);
    updateTime(nextH, tempMinutes, tempAmPm, value);
  };

  const handleMinuteChange = (increment: boolean) => {
    let nextM = tempMinutes + (increment ? 5 : -5);
    if (nextM >= 60) nextM = 0;
    if (nextM < 0) nextM = 55;
    setTempMinutes(nextM);
    updateTime(tempHours, nextM, tempAmPm, value);
  };

  const toggleAmPm = (mode: 'AM' | 'PM') => {
    if (mode === tempAmPm) return;
    setTempAmPm(mode);
    updateTime(tempHours, tempMinutes, mode, value);
  };

  const formattedDateString = value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTimeString = value.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={cn("space-y-1.5 relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block ml-1 mb-2">
          {label}
        </label>
      )}

      {/* Date Picker Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-slate-50 hover:bg-slate-100/80 border border-black/5 px-5 py-4 text-[#0F172A] font-extrabold text-xs transition-all flex items-center justify-between outline-none group",
          isOpen && "border-[#1E67FC] bg-white text-[#1E67FC]"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <CalendarBlank size={18} className={cn("text-slate-400 shrink-0 transition-colors", isOpen && "text-[#1E67FC]")} weight="duotone" />
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap overflow-hidden">
            <span className="text-[#0F172A] font-black">{formattedDateString}</span>
            <span className="text-slate-300 font-extrabold mx-0.5">•</span>
            <span className="text-slate-400 font-extrabold">{formattedTimeString}</span>
          </div>
        </div>
        <Clock size={18} className={cn("text-slate-300 shrink-0 transition-colors", isOpen && "text-[#1E67FC]")} weight="duotone" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className={cn(
          "absolute sm:w-[320px] w-[calc(100vw-32px)] bg-white border border-black/5 z-[3500] p-4 animate-in fade-in duration-200",
          effectiveDirection === 'bottom' && "top-[calc(100%+6px)] left-0 slide-in-from-top-2",
          effectiveDirection === 'top' && "bottom-[calc(100%+6px)] left-0 slide-in-from-bottom-2",
          effectiveDirection === 'left' && "bottom-0 right-[calc(100%+6px)] slide-in-from-right-2",
          effectiveDirection === 'right' && "bottom-0 left-[calc(100%+6px)] slide-in-from-left-2"
        )}>
          {/* Calendar Picker Section */}
          <div className="space-y-4">
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">
                {monthLabel}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 bg-slate-50 hover:bg-[#EBF2FF] text-slate-400 hover:text-[#1E67FC] flex items-center justify-center transition-all border border-black/5"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 bg-slate-50 hover:bg-[#EBF2FF] text-slate-400 hover:text-[#1E67FC] flex items-center justify-center transition-all border border-black/5"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>

            {/* Days list grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <span key={day} className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map(({ day, month, date }, idx) => {
                const isSelected = date.getDate() === value.getDate() &&
                                   date.getMonth() === value.getMonth() &&
                                   date.getFullYear() === value.getFullYear();
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(date)}
                    className={cn(
                      "w-8 h-8 text-[10px] font-black uppercase flex items-center justify-center transition-all border border-transparent",
                      month !== 'current' && "text-slate-300",
                      month === 'current' && !isSelected && "text-slate-600 hover:bg-slate-50",
                      isToday && !isSelected && "border-[#1E67FC]/40 text-[#1E67FC]",
                      isSelected && "bg-[#1E67FC] text-white font-black"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker Spinner Footer */}
          <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400 mr-1" weight="duotone" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Time
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hours selector dials */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleHourChange(true)}
                  className="text-[9px] font-black text-slate-400 hover:text-[#1E67FC]"
                >
                  <CaretUp weight="duotone" size={10} />
                </button>
                <span className="bg-slate-50 border border-black/5 px-2 py-1 text-[10px] font-black text-slate-700 w-7 text-center">
                  {tempHours}
                </span>
                <button
                  type="button"
                  onClick={() => handleHourChange(false)}
                  className="text-[9px] font-black text-slate-400 hover:text-[#1E67FC]"
                >
                  <CaretDown weight="duotone" size={10} />
                </button>
              </div>

              <span className="font-extrabold text-slate-400">:</span>

              {/* Minutes selector dials */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleMinuteChange(true)}
                  className="text-[9px] font-black text-slate-400 hover:text-[#1E67FC]"
                >
                  <CaretUp weight="duotone" size={10} />
                </button>
                <span className="bg-slate-50 border border-black/5 px-2 py-1 text-[10px] font-black text-slate-700 w-7 text-center">
                  {tempMinutes.toString().padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => handleMinuteChange(false)}
                  className="text-[9px] font-black text-slate-400 hover:text-[#1E67FC]"
                >
                  <CaretDown weight="duotone" size={10} />
                </button>
              </div>

              {/* AM/PM Switcher Segmented Control */}
              <div className="flex border border-black/5 bg-slate-50 p-0.5 ml-2">
                {(['AM', 'PM'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleAmPm(mode)}
                    className={cn(
                      "px-2 py-1 text-[9px] font-black tracking-widest transition-all",
                      tempAmPm === mode
                        ? "bg-[#1E67FC] text-white"
                        : "text-slate-400 hover:text-slate-700"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
