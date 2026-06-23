import { useEffect, useState, type ReactNode } from 'react'
import { formatEur } from '../lib/format'

export function Card({
  children,
  className = '',
  title,
  action,
}: {
  children: ReactNode
  className?: string
  title?: ReactNode
  action?: ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'subtle'
export function Button({
  children,
  onClick,
  variant = 'subtle',
  className = '',
  type = 'button',
  disabled,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  title?: string
}) {
  const styles: Record<BtnVariant, string> = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50',
    ghost:
      'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger:
      'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
    subtle:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'neutral' | 'good' | 'bad' | 'brand'
}) {
  const tones = {
    neutral: 'text-slate-900 dark:text-white',
    good: 'text-emerald-600 dark:text-emerald-400',
    bad: 'text-red-600 dark:text-red-400',
    brand: 'text-brand-600 dark:text-brand-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${tones[tone]}`}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}

/** Money: colours negatives red, used inline */
export function Money({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span
      className={`tabular-nums ${value < 0 ? 'text-red-600 dark:text-red-400' : ''} ${className}`}
    >
      {formatEur(value)}
    </span>
  )
}

/** A number input that parses German input and reports a number. */
export function NumberField({
  value,
  onCommit,
  className = '',
  placeholder,
  step = '0.01',
}: {
  value: number
  onCommit: (n: number) => void
  className?: string
  placeholder?: string
  step?: string
}) {
  const [local, setLocal] = useState(String(value))
  useEffect(() => {
    setLocal(String(value))
  }, [value])
  return (
    <input
      type="number"
      step={step}
      inputMode="decimal"
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const n = parseFloat(local.replace(',', '.'))
        onCommit(Number.isFinite(n) ? n : 0)
      }}
      className={`w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm tabular-nums outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${className}`}
    />
  )
}

export function TextField({
  value,
  onCommit,
  className = '',
  placeholder,
}: {
  value: string
  onCommit: (s: string) => void
  className?: string
  placeholder?: string
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => {
    setLocal(value)
  }, [value])
  return (
    <input
      type="text"
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      className={`w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${className}`}
    />
  )
}

export function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={
        color
          ? { backgroundColor: color + '22', color }
          : undefined
      }
    >
      {color && (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {children}
    </span>
  )
}
