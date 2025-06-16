
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
    setIsLoading(true);
    setError(null);
    setAppeal(null);

    if (typeof window !== 'undefined' && params.appealId) {
      const foundAppeal = getAppealById(params.appealId);

      if (!foundAppeal) {
        setError(`Appeal (ID: ${params.appealId}) not found. It might have been removed or the ID is incorrect.`);
        setIsLoading(false);
        return;
      }
      
      // Explicitly check for statuses that mean a decision is NOT ready for this page
      if (foundAppeal.status === 'Pending Validation' || foundAppeal.status === 'Needs Agent Review') {
        setError(`This appeal (ID: ${foundAppeal.id}) is still in status '${foundAppeal.status}'. A final decision has not been made, or it is still under review.`);
      } else if (foundAppeal.status !== 'Approved' && foundAppeal.status !== 'Rejected' && foundAppeal.status !== 'Info Requested') {
        // This case should ideally not be hit if status types are strictly followed
        setError(`Appeal (ID: ${foundAppeal.id}) has an unexpected or non-final status: '${foundAppeal.status}'.`);
      }
      // If no error is set above, the status is 'Approved', 'Rejected', or 'Info Requested', which are valid for DecisionDisplayClient
      setAppeal(foundAppeal);
      setIsLoading(false);
    } else if (typeof window !== 'undefined' && !params.appealId) {
        setError("Appeal ID is missing in the URL.");
        setIsLoading(false);
    }
  }, [params.appealId]);

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
     } else if (error.includes("unexpected or non-final status")) {
        title = "Error: Invalid Appeal Status";
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
  
  if (!appeal) {
    // Should be covered by isLoading or error, but as a fallback.
    return (
         <div className="container mx-auto py-8 text-center">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Appeal data could not be loaded.</AlertDescription>
            </Alert>
         </div>
    );
  }
  
  // If we reach here, status must be 'Approved', 'Rejected', or 'Info Requested'
  return (
    <div className="container mx-auto py-8">
      <DecisionDisplayClient appeal={appeal} />
    </div>
  );
}
