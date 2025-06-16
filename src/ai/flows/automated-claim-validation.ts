'use server';

/**
 * @fileOverview An automated claim validation process that checks policy terms, coverage, costing, and previous claim history.
 *
 * - automatedClaimValidation - A function that handles the automated claim validation process.
 * - AutomatedClaimValidationInput - The input type for the automatedClaimValidation function.
 * - AutomatedClaimValidationOutput - The return type for the automatedClaimValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedClaimValidationInputSchema = z.object({
  claimDetails: z.string().describe('The details of the claim.'),
  policyTerms: z.string().describe('The terms of the policy.'),
  coverageDetails: z.string().describe('The coverage details of the policy.'),
  claimedAmount: z.string().describe('The amount claimed by the policyholder (e.g., "$1250.75").'),
  allocatedBudget: z.number().optional().describe('The allocated budget for this type of claim, if available (e.g., 1500).'),
  previousClaimsHistory: z.string().describe('The previous claims history of the policyholder.'),
});
export type AutomatedClaimValidationInput = z.infer<typeof AutomatedClaimValidationInputSchema>;

const AutomatedClaimValidationOutputSchema = z.object({
  policyTermsCheck: z.string().describe('The result of the policy terms check (Pass/Fail/Needs Review).'),
  coverageCheck: z.string().describe('The result of the coverage check (Pass/Fail/Needs Review).'),
  costingCheck: z.string().describe('The result of the costing check (Pass/Fail/Needs Review). This considers if the claimed amount is reasonable and within any provided allocated budget.'),
  previousClaimsHistoryCheck: z.string().describe('The result of the previous claims history check (Pass/Fail/Needs Review).'),
  summaryRecommendation: z
    .enum(['Approve', 'Reject', 'Needs Agent Review'])
    .describe('The summary recommendation based on the validation results.'),
});
export type AutomatedClaimValidationOutput = z.infer<typeof AutomatedClaimValidationOutputSchema>;

export async function automatedClaimValidation(input: AutomatedClaimValidationInput): Promise<AutomatedClaimValidationOutput> {
  // Call the defined Genkit flow for automated claim validation.
  return automatedClaimValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedClaimValidationPrompt',
  input: {schema: AutomatedClaimValidationInputSchema},
  output: {schema: AutomatedClaimValidationOutputSchema},
  prompt: `You are an expert claim validator.
  You will receive claim details, policy terms, coverage details, claimed amount, optionally an allocated budget, and previous claims history.
  You will check the claim against the policy terms, coverage details, costing (including claimed amount against allocated budget if provided), and previous claims history.
  You will provide a Pass, Fail, or Needs Review status for each check. For the costing check, specifically state if the amount is within the allocated budget if one was provided.
  You will provide a summary recommendation based on the validation results. The recommendation should be one of the following: Approve, Reject, or Needs Agent Review.

  Claim Details: {{{claimDetails}}}
  Policy Terms: {{{policyTerms}}}
  Coverage Details: {{{coverageDetails}}}
  Claimed Amount: {{{claimedAmount}}}
  {{#if allocatedBudget}}
  Allocated Budget for this type of claim: {{{allocatedBudget}}}
  {{else}}
  No specific allocated budget provided for this claim.
  {{/if}}
  Previous Claims History: {{{previousClaimsHistory}}}

  Here's how to make the determination for each check (respond with Pass, Fail, or Needs Review):
  1.  Policy Terms Check: Check if the claim violates any policy terms.
  2.  Coverage Check: Check if the claim is covered under the policy.
  3.  Costing Check: Check if the claimed amount is reasonable, aligns with policy limits, and is within the allocated budget (if provided).
  4.  Previous Claims History Check: Check if the policyholder has a history of fraudulent or suspicious claims.

  Based on these checks, provide a summary recommendation (Approve, Reject, or Needs Agent Review).
  If any check results in 'Fail', the summary recommendation should generally be 'Reject' or 'Needs Agent Review'.
  If all checks 'Pass', the summary recommendation should generally be 'Approve'.
  If some checks are 'Pass' and others 'Needs Review', the summary should be 'Needs Agent Review'.
`,
});

const automatedClaimValidationFlow = ai.defineFlow(
  {
    name: 'automatedClaimValidationFlow',
    inputSchema: AutomatedClaimValidationInputSchema,
    outputSchema: AutomatedClaimValidationOutputSchema,
  },
  async input => {
    // Simulate steps and processing time for the verification and validation process.
    // This delay represents steps like reviewing against policy documents in detail,
    // adjusting the claim against entitlement based on policy terms, etc.

    // Step 1: Initial claim data ingestion and parsing
    console.log('Step 1: Initial claim data ingestion and parsing...');
 await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 seconds

 // Step 2: Reviewing against policy documents
    console.log('Step 2: Reviewing against policy documents...');
 await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 seconds

 // Step 3: Checking coverage details and exclusions
    console.log('Step 3: Checking coverage details and exclusions...');
 await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 seconds

 // Step 4: Adjusting against entitlement based on policy terms
    console.log('Step 4: Adjusting against entitlement based on policy terms...');
 await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 seconds
 // Total delay is now approximately 10 seconds (2+3+2+3)

    // Call the prompt with the input to get the initial validation results.
    const {output} = await prompt(input);
    // Return the validated output.
    return output!;
  }
);
