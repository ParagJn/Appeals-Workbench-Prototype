
"use client";

import React, { useEffect, useState } from 'react';
import AppealReviewClient from '@/components/appeals/AppealReviewClient';
import { getAppealById, getClaimById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Appeal, Claim } from '@/types';

interface AppealReviewPageProps {
  params: {
    appealId: string;
  };
}

export default function AppealReviewPage({ params: paramsAsPromise }: AppealReviewPageProps) {
  const params = React.use(paramsAsPromise); // Unwrap the params promise

  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setAppeal(null);
    setClaim(null);

    // This check is a bit redundant with "use client" but emphasizes client-only execution
    if (typeof window !== 'undefined') {
        const foundAppeal = getAppealById(params.appealId);

        if (!foundAppeal) {
            setError(`Appeal (ID: ${params.appealId}) not found. It might have been removed or the ID is incorrect.`);
            setIsLoading(false);
            return;
        }
        setAppeal(foundAppeal);

        const foundClaim = getClaimById(foundAppeal.claimId);
        if (!foundClaim) {
            setError(`Original claim (ID: ${foundAppeal.claimId}) associated with appeal ${foundAppeal.id} not found.`);
            // We found the appeal, but not its associated claim.
            // Depending on requirements, you might still want to show appeal details or treat as full error.
            // For now, treating as an error preventing review.
        } else {
            setClaim(foundClaim);
        }
        setIsLoading(false);
    }
  }, [params.appealId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading appeal details...</p>
      </div>
    );
  }

  if (error) {
    let title = "Error";
    if (error.includes("Appeal (ID: " + params.appealId + ") not found")) {
      title = "Error: Appeal Not Found";
    } else if (error.includes("Original claim (ID:")) {
      title = "Error: Original Claim Not Found";
    }

    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/appeals/in-progress">Go to Appeals In Progress</Link>
        </Button>
      </div>
    );
  }
  
  // If we reach here, appeal and claim should be loaded.
  // Error state handles cases where appeal or claim isn't found.
  // So, if appeal is set, but claim is null (due to error logic for claim not found),
  // the 'error' state would have been triggered.
  // This final check is for type safety for props passed to AppealReviewClient.
  if (!appeal || !claim) {
    // This state should ideally be fully covered by the error handling above.
    // Added for robustness in case of an unexpected state.
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error: Data Loading Inconsistency</AlertTitle>
          <AlertDescription>
            There was an unexpected issue loading the appeal or claim data. Please try again or contact support.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/appeals/in-progress">Go to Appeals In Progress</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left font-headline">Appeal Review & Validation</h1>
      <AppealReviewClient appealFromProps={appeal} claimFromProps={claim} />
    </div>
  );
}
