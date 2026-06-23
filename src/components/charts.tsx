import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatEur, formatEur0 } from '../lib/format'

interface Slice {
  name: string
  value: number
  color: string
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,0.3)',
  background: 'rgba(15,23,42,0.92)',
  color: '#fff',
  fontSize: 13,
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: Slice[]
  centerLabel?: string
  centerValue?: string
}) {
  const total = data.reduce((a, b) => a + b.value, 0)
  if (total <= 0)
    return <Empty>Keine Daten</Empty>
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number, n: string) => [formatEur(v), n]}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400">{centerLabel}</span>
          <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {centerValue}
          </span>
        </div>
      )}
    </div>
  )
}

export function Legendry({ data }: { data: Slice[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {data.map((d) => (
        <li key={d.name} className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="truncate text-slate-600 dark:text-slate-300">{d.name}</span>
          </span>
          <span className="shrink-0 tabular-nums text-slate-500">
            {formatEur(d.value)}{' '}
            <span className="text-slate-400">({Math.round((d.value / total) * 100)}%)</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function IncomeExpenseBar({
  income,
  expenses,
  rest,
}: {
  income: number
  expenses: number
  rest: number
}) {
  const data = [
    { name: 'Einkünfte', value: income, color: '#10b981' },
    { name: 'Kontobelastung', value: expenses, color: '#ef4444' },
    { name: 'Rest', value: rest, color: rest < 0 ? '#ef4444' : '#3478f6' },
  ]
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => formatEur0(v)}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'rgba(148,163,184,0.1)' }}
          formatter={(v: number) => [formatEur(v), 'Betrag']}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function WealthLineChart({
  data,
}: {
  data: { name: string; gesamt: number; spar: number }[]
}) {
  if (data.length === 0) return <Empty>Keine Szenarien</Empty>
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tickFormatter={(v) => formatEur0(v)}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatEur(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="gesamt"
          name="Gesamt-Vermögen"
          stroke="#3478f6"
          strokeWidth={3}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="spar"
          name="Spar-Vermögen"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
      {children}
    </div>
  )
}
