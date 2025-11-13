""

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { vi } from "date-fns/locale"
import { format, addYears, subYears, setMonth, getYear, getMonth } from "date-fns"
import type { Locale } from "date-fns"
import { cn } from "@utils/CN"
import { Button } from "@components/Atoms/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select"


export interface MonthYearPickerProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
  locale?: Locale
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
  fromYear?: number
  toYear?: number
}

function MonthYearPicker({
  className,
  selected,
  onSelect,
  locale = vi,
  disabled,
  initialFocus,
  fromYear = 2000,
  toYear = 2050,
}: MonthYearPickerProps) {
  const [date, setDate] = React.useState<Date>(selected || new Date())

  // Tạo danh sách các tháng
  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i.toString(),
      label: format(new Date(2000, i, 1), "MMMM", { locale }),
    }))
  }, [locale])

  // Tạo danh sách các năm
  const years = React.useMemo(() => {
    return Array.from({ length: toYear - fromYear + 1 }, (_, i) => ({
      value: (fromYear + i).toString(),
      label: (fromYear + i).toString(),
    }))
  }, [fromYear, toYear])

  // Xử lý khi chọn tháng
  const handleMonthChange = React.useCallback(
    (value: string) => {
      const newDate = setMonth(date, Number.parseInt(value, 10))
      setDate(newDate)
      onSelect?.(newDate)
    },
    [date, onSelect],
  )

  // Xử lý khi chọn năm
  const handleYearChange = React.useCallback(
    (value: string) => {
      const month = getMonth(date)
      const newDate = new Date(Number.parseInt(value, 10), month, 1)
      setDate(newDate)
      onSelect?.(newDate)
    },
    [date, onSelect],
  )

  // Xử lý khi nhấn nút năm trước
  const handlePrevYear = React.useCallback(() => {
    const newDate = subYears(date, 1)
    setDate(newDate)
    onSelect?.(newDate)
  }, [date, onSelect])

  // Xử lý khi nhấn nút năm sau
  const handleNextYear = React.useCallback(() => {
    const newDate = addYears(date, 1)
    setDate(newDate)
    onSelect?.(newDate)
  }, [date, onSelect])

  // Cập nhật date khi selected thay đổi từ bên ngoài
  React.useEffect(() => {
    if (selected) {
      setDate(selected)
    }
  }, [selected])

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevYear}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{format(date, "yyyy", { locale })}</div>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextYear}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Tháng</label>
          <Select value={getMonth(date).toString()} onValueChange={handleMonthChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Năm</label>
          <Select value={getYear(date).toString()} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export { MonthYearPicker }
