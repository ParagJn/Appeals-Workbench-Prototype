"use client";

import type { Appeal } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Info, Mail, MessageSquareText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface DecisionDisplayClientProps {
  appeal: Appeal;
}

export default function DecisionDisplayClient({ appeal }: DecisionDisplayClientProps) {
  const isApproved = appeal.status === 'Approved';
  const isRejected = appeal.status === 'Rejected';
  const isInfoRequested = appeal.status === 'Info Requested';

  const Icon = isApproved ? CheckCircle2 : isRejected ? XCircle : Info;
  const titleText = isApproved ? "Appeal Approved" : isRejected ? "Appeal Rejected" : "Information Requested";
  const cardBorderClass = isApproved ? "border-accent" : isRejected ? "border-destructive" : "border-yellow-500";
  const iconColorClass = isApproved ? "text-accent" : isRejected ? "text-destructive" : "text-yellow-600";

  return (
    <div className="max-w-2xl mx-auto">
      <Card className={`shadow-xl ${cardBorderClass}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Icon className={`h-16 w-16 ${iconColorClass}`} />
          </div>
          <CardTitle className={`text-3xl font-headline ${iconColorClass}`}>{titleText}</CardTitle>
          <CardDescription className="text-base">
            Regarding Appeal ID: <span className="font-semibold">{appeal.id}</span> for Claim ID: <span className="font-semibold">{appeal.claimId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Dear <span className="font-semibold">{appeal.policyHolderName}</span>,
          </p>
          {isApproved && (
            <p>We are pleased to inform you that your appeal has been <strong>approved</strong>. The original claim decision has been overturned.</p>
          )}
          {isRejected && (
            <p>We regret to inform you that after careful review, your appeal has been <strong>rejected</strong>. The original claim decision stands.</p>
          )}
          {isInfoRequested && (
            <p>We require additional information to process your appeal. Please check your communications for details on what is needed.</p>
          )}
          
          {appeal.finalDecisionDate && (
             <p className="text-sm text-muted-foreground">Decision Date: {format(new Date(appeal.finalDecisionDate), 'MMMM dd, yyyy')}</p>
          )}

          {appeal.agentComments && (
            <div>
              <h4 className="font-semibold">Agent Comments:</h4>
              <p className="text-muted-foreground p-3 bg-muted/50 rounded-md border border-border/70 italic">{appeal.agentComments}</p>
            </div>
          )}

          <Alert className="mt-6 bg-primary/5 border-primary/20">
            <Mail className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">Notification Simulation</AlertTitle>
            <AlertDescription>
              An email and SMS notification with these details have been simulated as sent to the policyholder. In a real system, these would be dispatched automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
