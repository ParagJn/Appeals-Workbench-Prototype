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
  costingDetails: z.string().describe('The costing details of the claim.'),
  previousClaimsHistory: z.string().describe('The previous claims history of the policyholder.'),
});
export type AutomatedClaimValidationInput = z.infer<typeof AutomatedClaimValidationInputSchema>;

const AutomatedClaimValidationOutputSchema = z.object({
  policyTermsCheck: z.string().describe('The result of the policy terms check (Pass/Fail).'),
  coverageCheck: z.string().describe('The result of the coverage check (Pass/Fail).'),
  costingCheck: z.string().describe('The result of the costing check (Pass/Fail).'),
  previousClaimsHistoryCheck: z.string().describe('The result of the previous claims history check (Pass/Fail).'),
  summaryRecommendation: z
    .enum(['Approve', 'Reject', 'Needs Agent Review'])
    .describe('The summary recommendation based on the validation results.'),
});
export type AutomatedClaimValidationOutput = z.infer<typeof AutomatedClaimValidationOutputSchema>;

export async function automatedClaimValidation(input: AutomatedClaimValidationInput): Promise<AutomatedClaimValidationOutput> {
  return automatedClaimValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedClaimValidationPrompt',
  input: {schema: AutomatedClaimValidationInputSchema},
  output: {schema: AutomatedClaimValidationOutputSchema},
  prompt: `You are an expert claim validator.
  You will receive claim details, policy terms, coverage details, costing details, and previous claims history.
  You will check the claim against the policy terms, coverage details, costing details, and previous claims history.
  You will provide a summary recommendation based on the validation results. The recommendation should be one of the following: Approve, Reject, or Needs Agent Review.

  Claim Details: {{{claimDetails}}}
  Policy Terms: {{{policyTerms}}}
  Coverage Details: {{{coverageDetails}}}
  Costing Details: {{{costingDetails}}}
  Previous Claims History: {{{previousClaimsHistory}}}

  Here's how to make the determination:
  1.  Policy Terms Check: Check if the claim violates any policy terms.
  2.  Coverage Check: Check if the claim is covered under the policy.
  3.  Costing Check: Check if the claim costs are within reasonable limits.
  4.  Previous Claims History Check: Check if the policyholder has a history of fraudulent claims.

  Based on these checks, provide a summary recommendation.
`,
});

const automatedClaimValidationFlow = ai.defineFlow(
  {
    name: 'automatedClaimValidationFlow',
    inputSchema: AutomatedClaimValidationInputSchema,
    outputSchema: AutomatedClaimValidationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
