
"use client";

import React, { useEffect, useState } from 'react';
import DecisionDisplayClient from '@/components/appeals/DecisionDisplayClient';
import { getAppealById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Appeal } from '@/types';

interface DecisionPageProps {
  params: {
    appealId: string;
  };
}

export default function DecisionPage({ params: paramsAsPromise }: DecisionPageProps) {
  const params = React.use(paramsAsPromise); // Unwrap the params promise

  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const appealId = params.appealId; 

    if (!appealId) {
      setError("Appeal ID is missing in the URL.");
      setIsLoading(false);
      setAppeal(null); 
      return;
    }

    // This effect should only run on the client after hydration.
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      setError(null); // Reset error at the beginning of data fetching
      setAppeal(null); // Reset appeal at the beginning

      const foundAppeal = getAppealById(appealId);

      if (!foundAppeal) {
        setError(`Appeal (ID: ${appealId}) not found. It might have been removed or the ID is incorrect.`);
      } else {
        // Logic to determine if appeal is displayable or an error should be shown
        switch (foundAppeal.status) {
          case 'Approved':
          case 'Rejected':
          case 'Info Requested':
            setAppeal(foundAppeal);
            // setError(null); // Ensure error is null if appeal is successfully set (already done above)
            break;
          case 'Pending Validation':
          case 'Needs Agent Review':
            setError(`This appeal (ID: ${foundAppeal.id}) is still in status '${foundAppeal.status}'. A final decision has not been made, or it is still under review.`);
            break;
          default:
            // Catches any unexpected status values
            // This cast is to satisfy TypeScript if new statuses are added but not covered.
            const unknownStatus: string = foundAppeal.status;
            setError(`Appeal (ID: ${foundAppeal.id}) has an unknown or unexpected status: '${unknownStatus}'.`);
            break;
        }
      }
      setIsLoading(false);
    }
    // If typeof window is undefined (e.g. server render pass), 
    // isLoading remains true, and client-side useEffect will take over.
  }, [params.appealId]); // Dependency on params.appealId

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading appeal decision...</p>
      </div>
    );
  }

  if (error) {
     let title = "Decision Not Available";
     if (error.includes("not found")) {
        title = "Error: Appeal Not Found";
     } else if (error.includes("unexpected status") || error.includes("unknown or unexpected status")) {
        title = "Error: Invalid Appeal Status";
     } else if (error.includes("still in status")) {
        // This will keep "Decision Not Available" for "still in status..." errors as per current behavior
     }
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/appeals/in-progress">View In Progress Appeals</Link>
        </Button>
         <Button asChild variant="link" className="mt-4">
          <Link href="/appeals/decided">View Decided Appeals</Link>
        </Button>
      </div>
    );
  }
  
  // If we reach here, isLoading is false and error is null.
  // appeal should be non-null if everything went well.
  if (!appeal) {
    // This is a fallback for an unexpected state where isLoading is false, error is null, but appeal is also null.
    // This might happen if params.appealId was initially null/undefined and not caught,
    // or some other logic error in useEffect.
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Appeal data could not be loaded due to an unexpected issue. Please verify the Appeal ID and try again.
          </AlertDescription>
        </Alert>
         <Button asChild variant="link" className="mt-4">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  // If appeal is loaded and no error, render the decision display
  return (
    <div className="container mx-auto py-8">
      <DecisionDisplayClient appeal={appeal} />
    </div>
  );
}
