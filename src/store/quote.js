import { reactive, readonly } from 'vue'

const state = reactive({
  coverType: null,
  coverStartDate: null,
  coverEndDate: null,
  carYear: null,
  carMake: null,
  carModel: null,
  carUsage: null,            // Step 4: { usage, commute, offPeak }
  carFinancing: null,        // not collected on Step 4 in the DA Figma frame; reserved
  annualDistance: null,
  driveLessEligible: false,  // DA-only: derived — annual distance < 8,000km
  mainDriver: {
    name: '',
    nric: '',
    dob: null,
    gender: '',
    maritalStatus: '',
    isPolicyholder: null,
  },
  drivingHistory: {
    yearsLicensed: null,
    atFaultClaims: null,
    notAtFaultClaims: null,
    certificateOfMerit: null,
    ncd: null,
    ncd60Years: null,        // DA-only: years held at 50% NCD (drives NCD60 eligibility)
    ncdZeroReason: null,     // shown when NCD = 0%
    otherCarNcd: null,       // shown when reason = "I have NCD on another car"
    ncdTransferFrom: null,   // ditto
    claims: null,
    convictions: null,
  },
  contact: {
    preferredName: '',
    email: '',
    phone: '',
    postalCode: '',
    marketingChannels: [],
    consentPdpa: false,
  },
  quoteSelection: {
    billingCycle: 'annual',
    excess: 600,
    promoCode: '',
  },
  hasAdditionalDrivers: null,
  hasOutsideDrivers: null,
  additionalDrivers: [],
  driveLess: null,           // DA-only: opted in to Drive Less, Pay Less (true/false)
  odometerReading: null,     // DA-only: required when Drive Less is opted in
  optionalBenefits: [],
})

function setField(path, value) {
  const keys = path.split('.')
  let cursor = state
  while (keys.length > 1) {
    cursor = cursor[keys.shift()]
  }
  cursor[keys[0]] = value
}

export function useQuote() {
  return {
    quote: readonly(state),
    mutable: state,
    setField,
  }
}
