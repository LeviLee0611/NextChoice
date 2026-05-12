'use client'

import { forwardRef, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { getMonth, getYear } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'

const MONTHS = ['1','2','3','4','5','6','7','8','9','10','11','12']

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 6h13" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 1v2M10.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="3.5" y="8" width="1.5" height="1.5" rx="0.3" fill="currentColor"/>
      <rect x="6.75" y="8" width="1.5" height="1.5" rx="0.3" fill="currentColor"/>
      <rect x="10" y="8" width="1.5" height="1.5" rx="0.3" fill="currentColor"/>
      <rect x="3.5" y="11" width="1.5" height="1.5" rx="0.3" fill="currentColor"/>
      <rect x="6.75" y="11" width="1.5" height="1.5" rx="0.3" fill="currentColor"/>
    </svg>
  )
}

interface CustomInputProps {
  value?: string
  onClick?: () => void
  placeholder?: string
}

const CustomInput = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <div ref={ref} className="relative w-full">
      <div
        className="w-full rounded-xl px-4 py-2.5 pr-12 text-sm select-none"
        style={{
          background: '#1a2416',
          border: '1px solid #2d3e28',
          minHeight: '42px',
          lineHeight: '1.5',
        }}
      >
        {value ? (
          <span style={{ color: '#e8dfc8' }}>{value}</span>
        ) : (
          <span className="flex items-center gap-2.5">
            <span style={{ color: '#5a6a50' }}>{placeholder}</span>
            <span style={{ color: '#4a5a40', fontSize: '0.78rem' }}>예: 05/08/2026</span>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center rounded-r-xl transition-colors"
        style={{ color: '#8a9478' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#d4a84b' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#8a9478' }}
      >
        <CalendarIcon />
      </button>
    </div>
  )
)
CustomInput.displayName = 'DatePickerInput'

interface DatePickerProps {
  name: string
  defaultValue?: string | null
}

export default function DatePicker({ name, defaultValue }: DatePickerProps) {
  const [selected, setSelected] = useState<Date | null>(
    defaultValue ? new Date(defaultValue + 'T00:00:00') : null
  )

  const stored = selected
    ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`
    : ''

  return (
    <>
      <ReactDatePicker
        selected={selected}
        onChange={(date: Date | null) => setSelected(date)}
        dateFormat="MM/dd/yyyy"
        placeholderText="날짜를 선택하세요"
        customInput={<CustomInput />}
        popperClassName="nc-popper"
        calendarClassName="nc-calendar"
        showPopperArrow={false}
        popperPlacement="right-start"
        renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
          <div className="nc-cal-header">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="nc-cal-nav"
            >
              ←
            </button>
            <span className="nc-cal-title">
              <span className="nc-cal-group">
                <span className="nc-cal-num">{getYear(date)}</span>
                <span className="nc-cal-unit">년</span>
              </span>
              <span className="nc-cal-group">
                <span className="nc-cal-num">{MONTHS[getMonth(date)]}</span>
                <span className="nc-cal-unit">월</span>
              </span>
            </span>
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="nc-cal-nav"
            >
              →
            </button>
          </div>
        )}
      />
      <input type="hidden" name={name} value={stored} />
    </>
  )
}
