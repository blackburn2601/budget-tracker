// German locale currency / number formatting helpers

const eur = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const eur0 = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const num = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "1.432,97 €" */
export const formatEur = (v: number): string => eur.format(v || 0)

/** "1.433 €" – rounded, for compact chart labels */
export const formatEur0 = (v: number): string => eur0.format(v || 0)

/** "1.432,97" – no currency symbol */
export const formatNum = (v: number): string => num.format(v || 0)

/** Parse a German-formatted user input ("1.432,97" or "1432.97") into a number */
export function parseGermanNumber(input: string): number {
  if (typeof input === 'number') return input
  const cleaned = String(input)
    .replace(/\s|€/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
