import { useStore } from '../store'
import { Button, Card, NumberField, Stat, TextField } from '../components/ui'
import { DonutChart, Legendry, WealthLineChart } from '../components/charts'
import {
  assetProjected,
  gesamtVermoegen,
  gesamtVermoegenProjected,
  sparVermoegen,
  totalMonthlyContribution,
} from '../lib/calc'
import {
  ASSET_TYPE_COLOR,
  ASSET_TYPE_LABEL,
  type Asset,
  type AssetType,
} from '../types'
import { formatEur } from '../lib/format'

const ASSET_TYPES: AssetType[] = ['tagesgeld', 'depot', 'krypto', 'gold', 'rente']

export default function Wealth() {
  const s = useStore((st) => st.active())
  const scenarios = useStore((st) => st.scenarios)
  const editMode = useStore((st) => st.editMode)
  const addAsset = useStore((st) => st.addAsset)
  if (!s) return null

  const gesamt = gesamtVermoegen(s.assets)
  const projected = gesamtVermoegenProjected(s.assets)

  // allocation by type
  const allocMap = new Map<AssetType, number>()
  for (const a of s.assets) allocMap.set(a.type, (allocMap.get(a.type) ?? 0) + a.current)
  const allocData = [...allocMap.entries()]
    .map(([type, value]) => ({ name: ASSET_TYPE_LABEL[type], value, color: ASSET_TYPE_COLOR[type] }))
    .filter((d) => d.value > 0)

  // wealth growth across scenarios (ordered)
  const growth = [...scenarios]
    .sort((a, b) => a.order - b.order)
    .map((x) => ({
      name: x.name,
      gesamt: gesamtVermoegen(x.assets),
      spar: sparVermoegen(x.assets),
    }))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Monatsvoraussicht</h2>
        <p className="mt-1 text-sm text-slate-500">{s.name} · Vermögensübersicht</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Spar-Vermögen" value={formatEur(sparVermoegen(s.assets))} tone="good" />
        <Stat label="Gesamt-Vermögen" value={formatEur(gesamt)} tone="brand" />
        <Stat label="Monatl. Sparrate" value={formatEur(totalMonthlyContribution(s.assets))} />
        <Stat
          label="Voraussicht (nächster Monat)"
          value={formatEur(projected)}
          hint={`+ ${formatEur(projected - gesamt)}`}
          tone="neutral"
        />
      </div>

      <Card title="Vermögenswerte" action={
        editMode && (
          <Button
            variant="primary"
            onClick={() =>
              addAsset(s.id, {
                name: 'Neuer Wert',
                type: 'tagesgeld',
                current: 0,
                monthlyAdd: 0,
                countsAsSavings: true,
              })
            }
          >
            + Wert
          </Button>
        )
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="py-2 pr-2 font-medium">Position</th>
                <th className="py-2 px-2 font-medium">Klasse</th>
                <th className="py-2 px-2 text-right font-medium">Aktuell</th>
                <th className="py-2 px-2 text-right font-medium">Monatl. +</th>
                <th className="py-2 px-2 text-right font-medium">Voraussicht</th>
                {editMode && <th className="py-2 pl-2"></th>}
              </tr>
            </thead>
            <tbody>
              {s.assets.map((a) => (
                <AssetRow key={a.id} scenarioId={s.id} asset={a} editMode={editMode} />
              ))}
              {s.assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Noch keine Vermögenswerte erfasst.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-bold dark:border-slate-700">
                <td className="py-2.5 pr-2" colSpan={2}>
                  Gesamt-Vermögen
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums">{formatEur(gesamt)}</td>
                <td className="py-2.5 px-2 text-right tabular-nums">
                  {formatEur(totalMonthlyContribution(s.assets))}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-brand-600 dark:text-brand-400">
                  {formatEur(projected)}
                </td>
                {editMode && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Asset-Allokation">
          {allocData.length ? (
            <>
              <DonutChart data={allocData} centerLabel="Gesamt" centerValue={formatEur(gesamt)} />
              <Legendry data={allocData} />
            </>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">Keine Daten.</p>
          )}
        </Card>

        <Card title="Vermögensentwicklung über Szenarien">
          <WealthLineChart data={growth} />
          <p className="mt-2 text-xs text-slate-400">
            Gesamt- und Spar-Vermögen je Szenario (chronologisch sortiert).
          </p>
        </Card>
      </div>
    </div>
  )
}

function AssetRow({
  scenarioId,
  asset,
  editMode,
}: {
  scenarioId: string
  asset: Asset
  editMode: boolean
}) {
  const updateAsset = useStore((st) => st.updateAsset)
  const deleteAsset = useStore((st) => st.deleteAsset)

  if (!editMode) {
    return (
      <tr className="border-b border-slate-50 dark:border-slate-800/50">
        <td className="py-2.5 pr-2 text-slate-800 dark:text-slate-200">{asset.name}</td>
        <td className="py-2.5 px-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
            style={{ background: ASSET_TYPE_COLOR[asset.type] + '22', color: ASSET_TYPE_COLOR[asset.type] }}
          >
            {ASSET_TYPE_LABEL[asset.type]}
          </span>
        </td>
        <td className="py-2.5 px-2 text-right tabular-nums">{formatEur(asset.current)}</td>
        <td className="py-2.5 px-2 text-right tabular-nums text-slate-500">
          {asset.monthlyAdd ? '+ ' + formatEur(asset.monthlyAdd) : '–'}
        </td>
        <td className="py-2.5 px-2 text-right font-medium tabular-nums">
          {formatEur(assetProjected(asset))}
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-50 dark:border-slate-800/50">
      <td className="py-2 pr-2">
        <TextField value={asset.name} onCommit={(name) => updateAsset(scenarioId, { ...asset, name })} />
      </td>
      <td className="py-2 px-2">
        <select
          value={asset.type}
          onChange={(e) => updateAsset(scenarioId, { ...asset, type: e.target.value as AssetType })}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {ASSET_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 px-2">
        <NumberField value={asset.current} onCommit={(v) => updateAsset(scenarioId, { ...asset, current: v })} />
      </td>
      <td className="py-2 px-2">
        <NumberField value={asset.monthlyAdd} onCommit={(v) => updateAsset(scenarioId, { ...asset, monthlyAdd: v })} />
      </td>
      <td className="py-2 px-2 text-right tabular-nums text-slate-400">
        {formatEur(assetProjected(asset))}
      </td>
      <td className="py-2 pl-2 text-right">
        <Button variant="danger" onClick={() => deleteAsset(scenarioId, asset.id)} title="Löschen">
          ✕
        </Button>
      </td>
    </tr>
  )
}
