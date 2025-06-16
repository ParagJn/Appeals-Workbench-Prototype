import type { Claim, Appeal } from '@/types';

const CLAIMS_STORAGE_KEY = 'claimflow_claims';
const APPEALS_STORAGE_KEY = 'claimflow_appeals';

const initialRejectedClaims: Claim[] = [
  {
    id: 'CLM001',
    policyHolderName: 'Alice Wonderland',
    rejectionReason: 'Procedure not covered under current policy terms.',
    claimAmount: 1250.75,
    rejectionDate: new Date('2023-10-15').toISOString(),
    policyId: 'POL9876',
    claimDetails: 'Claim for experimental heart surgery. Patient ID: P123. Procedure Code: XHS001.',
  },
  {
    id: 'CLM002',
    policyHolderName: 'Bob The Builder',
    rejectionReason: 'Claim submitted past the filing deadline.',
    claimAmount: 300.00,
    rejectionDate: new Date('2023-11-01').toISOString(),
    policyId: 'POL5432',
    claimDetails: 'Claim for toolkit replacement due to accidental damage. Incident Date: 2023-05-01. Submitted: 2023-11-01.',
  },
  {
    id: 'CLM003',
    policyHolderName: 'Charlie Brown',
    rejectionReason: 'Insufficient documentation provided to support the claim.',
    claimAmount: 75.50,
    rejectionDate: new Date('2023-11-20').toISOString(),
    policyId: 'POL1230',
    claimDetails: 'Claim for a kite repair. Photos of damage were blurry. Invoice not itemized.',
  },
  {
    id: 'CLM004',
    policyHolderName: 'Diana Prince',
    rejectionReason: 'Service provider out of network.',
    claimAmount: 2400.00,
    rejectionDate: new Date('2023-12-05').toISOString(),
    policyId: 'POL0001',
    claimDetails: 'Claim for invisible jet engine maintenance. Provider: Ares Mechanics. Policy requires Themyscira Certified providers.',
  },
];

// Utility to safely get data from localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Utility to safely set data to localStorage
function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}


export function getRejectedClaims(): Claim[] {
  const storedClaims = getFromStorage<Claim[]>(CLAIMS_STORAGE_KEY, []);
  if (storedClaims.length === 0) {
     // Initialize if empty for demo purposes
    setToStorage(CLAIMS_STORAGE_KEY, initialRejectedClaims);
    return initialRejectedClaims;
  }
  return storedClaims;
}

export function getClaimById(id: string): Claim | undefined {
  return getRejectedClaims().find(claim => claim.id === id);
}

export function getAppeals(): Appeal[] {
  return getFromStorage<Appeal[]>(APPEALS_STORAGE_KEY, []);
}

export function getAppealById(id: string): Appeal | undefined {
  return getAppeals().find(appeal => appeal.id === id);
}

export function addAppeal(appeal: Appeal): void {
  const appeals = getAppeals();
  setToStorage(APPEALS_STORAGE_KEY, [...appeals, appeal]);
}

export function updateAppeal(updatedAppeal: Appeal): void {
  const appeals = getAppeals();
  const index = appeals.findIndex(a => a.id === updatedAppeal.id);
  if (index !== -1) {
    appeals[index] = updatedAppeal;
    setToStorage(APPEALS_STORAGE_KEY, appeals);
  }
}

export const BPO_AGENTS = ["Agent Smith", "Agent Jones", "Agent Brown", "Agent Davis"];

export const SAMPLE_POLICY_TERMS = "Policy covers only pre-approved medical procedures. Experimental treatments are excluded. Claims must be submitted within 90 days of service. Out-of-network providers are covered at 50% after deductible, if emergency.";
export const SAMPLE_COVERAGE_DETAILS = "Covered items: Standard surgical procedures, prescribed medications, emergency room visits. Excluded: Cosmetic surgery, non-prescribed supplements, experimental drugs.";
export const SAMPLE_PREVIOUS_CLAIMS_HISTORY = "No history of fraudulent claims. Two minor claims in the last 5 years, both approved.";
