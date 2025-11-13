'';

import { Calendar } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-day-picker/dist/style.css';
import { cn } from '@utils/CN';

// Custom styles for the calendar
const calendarStyles = `
  .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: var(--color-primary);
    --rdp-background-color: #e7edff;
    --rdp-accent-color-dark: var(--color-primary-dark);
    --rdp-background-color-dark: #180270;
    --rdp-outline: 2px solid var(--rdp-accent-color);
    --rdp-outline-selected: 2px solid rgba(0, 0, 0, 0.75);
    margin: 1em;
  }

  .rdp-day_selected,
  .rdp-day_selected:focus-visible,
  .rdp-day_selected:hover {
    color: white;
    background-color: var(--color-primary);
    border-radius: 100%;
  }

  .rdp-day_today {
    color: var(--color-primary);
    background-color: rgba(173, 219, 93, 0.2);
    border-radius: 100%;
  }

  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: rgba(173, 219, 93, 0.1);
    border-radius: 100%;
  }

  .rdp-nav_button {
    color: var(--color-secondary);
  }

  .rdp-nav_button:hover {
    background-color: rgba(173, 219, 93, 0.1);
  }

  .rdp-caption {
    color: var(--color-secondary);
    font-weight: 600;
  }

  .rdp-head_cell {
    color: var(--color-secondary);
    font-weight: 500;
  }

  .rdp-day {
    color: var(--color-secondary);
    font-weight: 500;
  }
`;

interface CustomDatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
    popupClassName?: string;
    dayPickerProps?: Partial<DayPickerProps>;
    hasError?: boolean;
}

export default function CustomDatePicker({
    value,
    onChange,
    placeholder = 'Chọn ngày',
    className,
    containerClassName,
    popupClassName,
    dayPickerProps = {},
    hasError = false,
}: CustomDatePickerProps) {
    const [open, setOpen] = useState(false);
    const [today, setToday] = useState<Date | null>(null);
    const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('right');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setToday(new Date());
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Handlers for each mode
    const handleSingleSelect: import('react-day-picker').OnSelectHandler<Date | undefined> = (date) => {
        onChange(date || null);
        setOpen(false);
    };
    const handleMultipleSelect: import('react-day-picker').OnSelectHandler<Date[] | undefined> = (dates) => {
        // For multiple, you may want to pass the last selected date or the array
        // Here, we pass the last date or null
        if (Array.isArray(dates) && dates.length > 0) {
            onChange(dates[dates.length - 1]);
        } else {
            onChange(null);
        }
        setOpen(false);
    };
    const handleRangeSelect: import('react-day-picker').OnSelectHandler<import('react-day-picker').DateRange | undefined> = (range) => {
        // For range, you may want to pass the 'to' date or the full range
        // Here, we pass the 'to' date if exists, else 'from', else null
        if (range && range.to) {
            onChange(range.to);
        } else if (range && range.from) {
            onChange(range.from);
        } else {
            onChange(null);
        }
        setOpen(false);
    };

    const formatDate = (date: Date | null) => {
        return date ? date.toLocaleDateString('vi-VN') : '';
    };

    // Default values for other props
    const defaultCaptionLayout = 'dropdown' as const;
    const defaultDayPickerProps = {
        captionLayout: defaultCaptionLayout,
        startMonth: new Date(2024, 6),
        classNames: {
            selected: 'selected',
            chevron: '',
        },
        modifiersStyles: {
            selected: {
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '100%',
            },
            today: {
                color: 'var(--color-primary)',
                borderRadius: '100%',
                backgroundColor: 'rgba(173, 219, 93, 0.2)',
            },
        },
    };

    // Determine mode and render DayPicker with correct props
    const mode = dayPickerProps?.mode ?? 'single';
    // Check if disabled prop was explicitly passed
    const hasDisabledProp = dayPickerProps && 'disabled' in dayPickerProps;
    // Only apply default disabled (before today) if disabled prop wasn't explicitly passed
    const finalDisabled = hasDisabledProp ? dayPickerProps.disabled : (today ? { before: today } : undefined);

    let dayPickerNode: React.ReactNode = null;
    if (mode === 'single') {
        const singleProps = dayPickerProps as Partial<import('react-day-picker').PropsSingle>;
        const { selected, ...restDayPickerProps } = singleProps;
        const selectedDate = selected ?? (value instanceof Date ? value : undefined);
        dayPickerNode = (
            <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleSingleSelect}
                disabled={finalDisabled}
                defaultMonth={dayPickerProps?.defaultMonth ?? (value instanceof Date ? value : today ?? undefined)}
                {...defaultDayPickerProps}
                {...restDayPickerProps}
            />
        );
    } else if (mode === 'multiple') {
        const multiProps = dayPickerProps as Partial<import('react-day-picker').PropsMulti>;
        const { selected, ...restDayPickerProps } = multiProps;
        dayPickerNode = (
            <DayPicker
                mode="multiple"
                selected={selected}
                onSelect={handleMultipleSelect}
                disabled={finalDisabled}
                defaultMonth={dayPickerProps?.defaultMonth ?? (today ?? undefined)}
                {...defaultDayPickerProps}
                {...restDayPickerProps}
            />
        );
    } else if (mode === 'range') {
        const rangeProps = dayPickerProps as Partial<import('react-day-picker').PropsRange>;
        const { selected, ...restDayPickerProps } = rangeProps;
        dayPickerNode = (
            <DayPicker
                mode="range"
                selected={selected}
                onSelect={handleRangeSelect}
                disabled={finalDisabled}
                defaultMonth={dayPickerProps?.defaultMonth ?? (today ?? undefined)}
                {...defaultDayPickerProps}
                {...restDayPickerProps}
            />
        );
    }

    const handleOpen = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            if (rect.left < window.innerWidth / 2) {
                setPopupPosition('left');
            } else {
                setPopupPosition('right');
            }
        }
        setOpen(true);
    };

    return (
        <>
            <style>{calendarStyles}</style>
            <div ref={containerRef} className={cn("relative w-full", containerClassName)}>
                <input
                    type="text"
                    readOnly
                    className={cn(
                        "w-full px-4 py-2 border rounded-lg cursor-pointer text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200",
                        hasError ? "border-red-500 focus:ring-red-500" : "border-gray-600",
                        className
                    )}
                    placeholder={placeholder}
                    value={formatDate(value)}
                    onClick={handleOpen}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-black hover:text-gray-700 transition-colors" onClick={handleOpen}>
                    <Calendar className='w-5 h-5' />
                </span>
                <AnimatePresence>
                    {open && today && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: -10,
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                            className={cn(
                                `absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 max-w-xs w-[320px] ${popupPosition === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'}`,
                                popupClassName
                            )}
                            style={{ minWidth: 280 }}
                        >
                            <div className="p-4">
                                {dayPickerNode}
                            </div>
                            <div className="px-4 pb-4">
                                <button
                                    type="button"
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium text-sm"
                                    onClick={() => {
                                        if (today) {
                                            onChange(today);
                                            setOpen(false);
                                        }
                                    }}
                                >
                                    Hôm nay
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
