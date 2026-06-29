import { computed } from 'vue'
import { useQuote } from '../store/quote'

/**
 * Central pricing for the running quote — single source of truth for the
 * expandable price footer (DaQuoteFooter) from Step 9 onward, so the headline
 * and the breakdown stay consistent across every page.
 *
 * The figures are illustrative (no live rating engine). The base premium is the
 * designed $416.00; selections made later (named under-30 drivers, the
 * household / authorised driver plans, low-mileage discount) move the running
 * total, mirroring the BDI behaviour.
 */
const COVER_LABEL = {
  comprehensive: 'Comprehensive',
  'third-party-fire-theft': 'Third Party, Fire & Theft',
  'third-party': 'Third Party Only',
}

function money(cents) {
  return '$' + (cents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const BASE = 41600 // $416.00 designed base premium

export function useDaPricing() {
  const { quote } = useQuote()

  const billing = computed(() => (quote.quoteSelection?.billingCycle === 'instalment' ? 'instalment' : 'single'))
  const coverLabel = computed(() => COVER_LABEL[quote.coverType] || 'Comprehensive')

  const driverCount = computed(() => quote.additionalDrivers?.length || 0)
  const driverImpact = computed(() => (quote.hasUnder30Drivers === true && driverCount.value > 0 ? 5000 : 0))
  const householdImpact = computed(() => (quote.hasAdditionalDrivers === true && quote.hasUnder30Drivers === false ? 25000 : 0))
  const authorisedImpact = computed(() => (quote.hasOutsideDrivers === true ? 20000 : 0))
  const mileageDiscount = computed(() => (quote.driveLess === true ? 2000 : 0))

  const totalCents = computed(() =>
    BASE + driverImpact.value + householdImpact.value + authorisedImpact.value - mileageDiscount.value
  )

  const displayAmount = computed(() => money(totalCents.value))
  // KB 38971919: never "per year". Single = "Total"; Instalment = "per month".
  const periodLabel = computed(() => (billing.value === 'single' ? 'Total' : 'per month'))

  const rows = computed(() => {
    const r = [
      { label: 'Subtotal', value: money(24000) },
      { label: 'Medical expenses', value: money(8000) },
    ]
    if (driverImpact.value) r.push({ label: `Named drivers (${driverCount.value})`, value: '+' + money(driverImpact.value) })
    if (householdImpact.value) r.push({ label: 'Household driver plan', value: '+' + money(householdImpact.value) })
    if (authorisedImpact.value) r.push({ label: 'Authorised driver plan', value: '+' + money(authorisedImpact.value) })
    if (mileageDiscount.value) r.push({ label: 'Low mileage', value: '- ' + money(mileageDiscount.value), good: true })
    r.push({ label: 'GST (9%)', value: money(3600) })
    if (billing.value === 'single') r.push({ label: 'Single payment 3% discount', value: 'Included', good: true })
    return r
  })

  const promos = computed(() => quote.appliedPromos || [])

  return { billing, coverLabel, displayAmount, periodLabel, rows, promos }
}
