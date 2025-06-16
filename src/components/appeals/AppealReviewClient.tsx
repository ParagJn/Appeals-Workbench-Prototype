"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Appeal, Claim } from '@/types';
import { automatedClaimValidation, AutomatedClaimValidationInput, AutomatedClaimValidationOutput } from '@/ai/flows/automated-claim-validation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateAppeal, SAMPLE_POLICY_TERMS, SAMPLE_COVERAGE_DETAILS, SAMPLE_PREVIOUS_CLAIMS_HISTORY } from '@/lib/data';
import { CheckCircle, XCircle, AlertTriangle, ThumbsUp, ThumbsDown, MessageSquare, Info, Bot, User, FileText, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AppealReviewClientProps {
  appealFromProps: Appeal;
  claimFromProps: Claim;
}

export default function AppealReviewClient({ appealFromProps, claimFromProps }: AppealReviewClientProps) {
  const [appeal, setAppeal] = useState<Appeal>(appealFromProps);
  const [claim] = useState<Claim>(claimFromProps);
  const [isLoadingValidation, setIsLoadingValidation] = useState(false);
  const [agentComment, setAgentComment] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (appeal.status === 'Pending Validation' && !appeal.validationResult) {
      setIsLoadingValidation(true);
      startTransition(async () => {
        try {
          const validationInput: AutomatedClaimValidationInput = {
            claimDetails: claim.claimDetails || `Claim ID ${claim.id}, Amount: $${claim.claimAmount}, Policy Holder: ${claim.policyHolderName}. Rejection Reason: ${claim.rejectionReason}. Appealed with reason: ${appeal.appealReason}`,
            policyTerms: SAMPLE_POLICY_TERMS,
            coverageDetails: SAMPLE_COVERAGE_DETAILS,
            costingDetails: `Claim Amount: $${claim.claimAmount}. Submitted for appeal.`,
            previousClaimsHistory: SAMPLE_PREVIOUS_CLAIMS_HISTORY,
          };
          const result = await automatedClaimValidation(validationInput);
          
          const updatedAppeal: Appeal = {
            ...appeal,
            validationResult: result,
            status: result.summaryRecommendation === 'Needs Agent Review' ? 'Needs Agent Review' : appeal.status, 
          };
          if (result.summaryRecommendation === 'Approve') updatedAppeal.status = 'Approved';
          if (result.summaryRecommendation === 'Reject') updatedAppeal.status = 'Rejected';
          
          updateAppeal(updatedAppeal);
          setAppeal(updatedAppeal);

          toast({
            title: "Automated Validation Complete",
            description: `AI Recommendation: ${result.summaryRecommendation}`,
            variant: result.summaryRecommendation === "Reject" ? "destructive" : "default",
          });

        } catch (error) {
          console.error("Error during automated validation:", error);
          toast({
            title: "Validation Error",
            description: "Could not complete automated validation.",
            variant: "destructive",
          });
          const errorAppeal = {...appeal, status: 'Needs Agent Review' }; // Fallback to agent review
          updateAppeal(errorAppeal);
          setAppeal(errorAppeal);
        } finally {
          setIsLoadingValidation(false);
        }
      });
    }
  }, [appeal, claim, toast]);

  const handleAgentDecision = async (decision: 'Approved' | 'Rejected' | 'Info Requested') => {
    setIsSubmittingDecision(true);
    try {
      const finalAppeal: Appeal = {
        ...appeal,
        status: decision,
        agentComments: agentComment,
        finalDecisionDate: new Date().toISOString(),
      };
      updateAppeal(finalAppeal);
      setAppeal(finalAppeal); // Update local state to reflect change immediately

      toast({
        title: `Appeal ${decision}`,
        description: `Appeal ID ${appeal.id} has been ${decision.toLowerCase()}.`,
        variant: decision === 'Rejected' ? 'destructive' : 'default',
      });
      
      // Navigate to a decision page or dashboard
      router.push(`/appeals/decision/${appeal.id}`);

    } catch (error) {
      console.error("Error submitting agent decision:", error);
      toast({
        title: "Error Submitting Decision",
        description: "Could not save the agent's decision.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const ValidationIcon = ({ status }: { status: string }) => {
    if (status.toLowerCase() === 'pass') return <CheckCircle className="h-5 w-5 text-green-500 inline mr-2" />;
    if (status.toLowerCase() === 'fail') return <XCircle className="h-5 w-5 text-red-500 inline mr-2" />;
    return <Info className="h-5 w-5 text-yellow-500 inline mr-2" />;
  };

  const RecommendationIcon = ({ recommendation }: { recommendation?: 'Approve' | 'Reject' | 'Needs Agent Review' }) => {
    if (recommendation === 'Approve') return <ThumbsUp className="h-5 w-5 text-accent inline mr-2" />;
    if (recommendation === 'Reject') return <ThumbsDown className="h-5 w-5 text-destructive inline mr-2" />;
    if (recommendation === 'Needs Agent Review') return <AlertTriangle className="h-5 w-5 text-yellow-500 inline mr-2" />;
    return null;
  };


  if (appeal.status === 'Approved' || appeal.status === 'Rejected' && appeal.finalDecisionDate) {
     return (
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            {appeal.status === 'Approved' ? <CheckCircle className="h-8 w-8 text-accent mr-2" /> : <XCircle className="h-8 w-8 text-destructive mr-2" />}
            Appeal {appeal.status}
          </CardTitle>
          <CardDescription>
            Decision for Appeal ID: {appeal.id} (Claim ID: {claim.id})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Policy Holder: <strong>{appeal.policyHolderName}</strong></p>
          <p>Decision Date: <strong>{format(new Date(appeal.finalDecisionDate), 'MM/dd/yyyy HH:mm')}</strong></p>
          {appeal.agentComments && <p className="mt-2">Agent Comments: <em>{appeal.agentComments}</em></p>}
          {appeal.validationResult && (
            <div className="mt-4 p-4 border rounded-md bg-muted/30">
              <h4 className="font-semibold mb-2 text-sm">Original AI Validation Summary:</h4>
              <p className="text-sm"><RecommendationIcon recommendation={appeal.validationResult.summaryRecommendation} />AI Recommendation: {appeal.validationResult.summaryRecommendation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
           <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      {/* Claim and Appeal Details */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Appeal Details - ID: <Badge variant="outline">{appeal.id}</Badge></CardTitle>
          <CardDescription>
            Original Claim ID: <Badge variant="secondary">{claim.id}</Badge> | Policy Holder: {appeal.policyHolderName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">Original Rejection Reason:</h4>
            <p className="text-muted-foreground text-sm">{claim.rejectionReason}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Appeal Reason:</h4>
            <p className="text-muted-foreground text-sm">{appeal.appealReason}</p>
          </div>
          {appeal.supportingDocuments && appeal.supportingDocuments.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm">Supporting Documents:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {appeal.supportingDocuments.map(doc => <li key={doc.name}><FileText className="inline h-4 w-4 mr-1"/>{doc.name}</li>)}
              </ul>
            </div>
          )}
          <p className="text-sm">Submitted: <span className="font-medium">{format(new Date(appeal.submissionDate), 'MM/dd/yyyy HH:mm')}</span></p>
          <p className="text-sm">Assigned Agent: <span className="font-medium">{appeal.assignedAgent || 'N/A'}</span></p>
          <p className="text-sm">Current Status: <Badge variant={appeal.status === "Needs Agent Review" ? "secondary" : "default"}>{appeal.status}</Badge></p>
        </CardContent>
      </Card>

      {/* Automated Validation Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Bot className="h-6 w-6 mr-2 text-primary" />Automated Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingValidation || isPending ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Performing automated validation...</p>
            </div>
          ) : appeal.validationResult ? (
            <div className="space-y-3">
              <p><ValidationIcon status={appeal.validationResult.policyTermsCheck} />Policy Terms Check: <strong>{appeal.validationResult.policyTermsCheck}</strong></p>
              <p><ValidationIcon status={appeal.validationResult.coverageCheck} />Coverage Check: <strong>{appeal.validationResult.coverageCheck}</strong></p>
              <p><ValidationIcon status={appeal.validationResult.costingCheck} />Costing Check: <strong>{appeal.validationResult.costingCheck}</strong></p>
              <p><ValidationIcon status={appeal.validationResult.previousClaimsHistoryCheck} />Previous Claims History Check: <strong>{appeal.validationResult.previousClaimsHistoryCheck}</strong></p>
              <Separator className="my-3" />
              <p className="font-semibold text-lg"><RecommendationIcon recommendation={appeal.validationResult.summaryRecommendation} />AI Summary Recommendation: <span className="text-primary">{appeal.validationResult.summaryRecommendation}</span></p>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Validation Pending or Failed</AlertTitle>
              <AlertDescription>
                Automated validation results are not yet available or an error occurred.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Agent Review Section */}
      {appeal.status === 'Needs Agent Review' && appeal.validationResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><User className="h-6 w-6 mr-2 text-primary"/>Agent Review</CardTitle>
            <CardDescription>Review the details and make a decision for Appeal ID: {appeal.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your comments here... (e.g., reason for decision, request for specific information)"
              value={agentComment}
              onChange={(e) => setAgentComment(e.target.value)}
              className="min-h-[100px]"
              aria-label="Agent Comments"
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button onClick={() => handleAgentDecision('Info Requested')} variant="outline" disabled={isSubmittingDecision || isLoadingValidation || isPending}>
              <Info className="mr-2 h-4 w-4" /> Request More Info
            </Button>
            <Button onClick={() => handleAgentDecision('Reject')} variant="destructive" disabled={isSubmittingDecision || isLoadingValidation || isPending}>
              {isSubmittingDecision ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsDown className="mr-2 h-4 w-4" />} Reject Appeal
            </Button>
            <Button onClick={() => handleAgentDecision('Approved')} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmittingDecision || isLoadingValidation || isPending}>
               {isSubmittingDecision ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className="mr-2 h-4 w-4" />} Approve Appeal
            </Button>
          </CardFooter>
        </Card>
      )}
       { (appeal.status === 'Approved' || appeal.status === 'Rejected') && !appeal.finalDecisionDate && appeal.validationResult && appeal.validationResult.summaryRecommendation !== 'Needs Agent Review' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              {appeal.status === 'Approved' ? <CheckCircle className="h-6 w-6 mr-2 text-accent"/> : <XCircle className="h-6 w-6 mr-2 text-destructive"/>}
              Confirm AI Decision: {appeal.status}
            </CardTitle>
            <CardDescription>The AI has recommended to {appeal.status.toLowerCase()} this appeal.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The automated validation process resulted in a recommendation to <strong>{appeal.status.toLowerCase()}</strong> this appeal. If you agree, confirm the decision.</p>
            <Textarea
              placeholder="Optional comments if overriding or confirming AI decision..."
              value={agentComment}
              onChange={(e) => setAgentComment(e.target.value)}
              className="min-h-[80px] mt-4"
              aria-label="Agent Comments for AI Decision"
            />
          </CardContent>
          <CardFooter className="flex justify-end">
             <Button onClick={() => handleAgentDecision(appeal.status as 'Approved' | 'Rejected')} variant="default" disabled={isSubmittingDecision || isLoadingValidation || isPending}>
              <Send className="mr-2 h-4 w-4" /> Confirm Decision
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
