
import type { Claim, Appeal } from '@/types';

const CLAIMS_STORAGE_KEY = 'claimflow_claims';
const APPEALS_STORAGE_KEY = 'claimflow_appeals';

export const BPO_AGENTS = ["Agent Smith", "Agent Jones", "Agent Brown", "Agent Davis"];

const initialRejectedClaims: Claim[] = [
  {
    id: 'CLM001',
    policyHolderName: 'Alice Wonderland',
    rejectionReason: 'Procedure not covered under current policy terms.',
    claimAmount: 1250.75,
    allocatedAmount: 1500,
    rejectionDate: new Date('2023-10-15').toISOString(),
    policyId: 'POL9876',
    claimDetails: 'Claim for experimental heart surgery. Patient ID: P123. Procedure Code: XHS001.',
  },
  {
    id: 'CLM002',
    policyHolderName: 'Bob The Builder',
    rejectionReason: 'Claim submitted past the filing deadline.',
    claimAmount: 300.00,
    allocatedAmount: 250,
    rejectionDate: new Date('2023-11-01').toISOString(),
    policyId: 'POL5432',
    claimDetails: 'Claim for toolkit replacement due to accidental damage. Incident Date: 2023-05-01. Submitted: 2023-11-01.',
  },
  {
    id: 'CLM003',
    policyHolderName: 'Charlie Brown',
    rejectionReason: 'Insufficient documentation provided to support the claim.',
    claimAmount: 75.50,
    allocatedAmount: 100,
    rejectionDate: new Date('2023-11-20').toISOString(),
    policyId: 'POL1230',
    claimDetails: 'Claim for a kite repair. Photos of damage were blurry. Invoice not itemized.',
  },
  {
    id: 'CLM004',
    policyHolderName: 'Diana Prince',
    rejectionReason: 'Service provider out of network.',
    claimAmount: 2400.00,
    allocatedAmount: 3000,
    rejectionDate: new Date('2023-12-05').toISOString(),
    policyId: 'POL0001',
    claimDetails: 'Claim for invisible jet engine maintenance. Provider: Ares Mechanics. Policy requires Themyscira Certified providers.',
  },
  {
    id: 'CLM005',
    policyHolderName: 'Eva Evergreen',
    rejectionReason: 'Initially miscategorized, eligible for standard coverage.',
    claimAmount: 200.00,
    allocatedAmount: 1000,
    rejectionDate: new Date('2023-12-10').toISOString(),
    policyId: 'POL7788',
    claimDetails: 'Claim for standard dental check-up. Patient ID: P789. Procedure Code: DC001.',
  },
];

const initialAppeals: Appeal[] = [
  {
    id: 'APL-SIM001',
    claimId: 'CLM005', // Linked to the claim designed to pass
    policyHolderName: 'Eva Evergreen',
    appealReason: 'This was a standard procedure and should be covered as per my policy. The initial rejection seems to be an error.',
    supportingDocuments: [{ name: 'dentist_invoice.pdf' }],
    submissionDate: new Date('2023-12-11T10:00:00Z').toISOString(),
    status: 'Pending Validation',
    assignedAgent: BPO_AGENTS[0],
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
  if (storedClaims.length === 0 || !storedClaims.some(c => c.id === 'CLM005') || !storedClaims.every(claim => 'allocatedAmount' in claim) ) {
    const claimsToStore = initialRejectedClaims.map(claim => ({
        ...claim, 
        allocatedAmount: claim.allocatedAmount !== undefined ? claim.allocatedAmount : (claim.claimAmount * 1.2) 
    }));
    setToStorage(CLAIMS_STORAGE_KEY, claimsToStore);
    return claimsToStore;
  }
  return storedClaims;
}

export function getClaimById(id: string): Claim | undefined {
  return getRejectedClaims().find(claim => claim.id === id);
}

export function getAppeals(): Appeal[] {
  const storedAppeals = getFromStorage<Appeal[]>(APPEALS_STORAGE_KEY, []);
  if (storedAppeals.length === 0 || !storedAppeals.some(a => a.id === 'APL-SIM001')) {
    // If appeals are empty or our specific simulation appeal isn't there, initialize.
    // This ensures our simulation appeal is always available on a fresh start.
    // It might add duplicates if other appeals existed but not APL-SIM001,
    // but for simulation purposes and to ensure APL-SIM001 is present, this is acceptable.
    // A more robust approach would merge or check more carefully.
    const appealsToStore = [...initialAppeals]; // Start with our initial appeal
    // Add existing appeals that are not the one we are initializing to avoid total wipeout
    // This is a simple merge, more complex logic might be needed for general purpose.
    storedAppeals.forEach(sa => {
      if (!appealsToStore.find(ia => ia.id === sa.id)) {
        appealsToStore.push(sa);
      }
    });
    setToStorage(APPEALS_STORAGE_KEY, appealsToStore);
    return appealsToStore;
  }
  return storedAppeals;
}

export function getAppealById(id: string): Appeal | undefined {
  return getAppeals().find(appeal => appeal.id === id);
}

export function addAppeal(appeal: Appeal): void {
  const appeals = getAppeals();
  // Prevent adding duplicate by ID
  if (!appeals.find(a => a.id === appeal.id)) {
    setToStorage(APPEALS_STORAGE_KEY, [...appeals, appeal]);
  } else {
     // Optionally update if it exists, or log a warning. For now, just don't re-add.
    console.warn(`Appeal with ID ${appeal.id} already exists. Not adding again.`);
  }
}

export function updateAppeal(updatedAppeal: Appeal): void {
  const appeals = getAppeals();
  const index = appeals.findIndex(a => a.id === updatedAppeal.id);
  if (index !== -1) {
    appeals[index] = updatedAppeal;
    setToStorage(APPEALS_STORAGE_KEY, appeals);
  }
}

export const SAMPLE_POLICY_TERMS = "Policy covers only pre-approved medical procedures. Experimental treatments are excluded. Claims must be submitted within 90 days of service. Out-of-network providers are covered at 50% after deductible, if emergency.";
export const SAMPLE_COVERAGE_DETAILS = "Covered items: Standard surgical procedures, prescribed medications, emergency room visits. Excluded: Cosmetic surgery, non-prescribed supplements, experimental drugs.";
export const SAMPLE_PREVIOUS_CLAIMS_HISTORY = "No history of fraudulent claims. Two minor claims in the last 5 years, both approved.";

