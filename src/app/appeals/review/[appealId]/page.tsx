import AppealReviewClient from '@/components/appeals/AppealReviewClient';
import { getAppealById, getClaimById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AppealReviewPageProps {
  params: {
    appealId: string;
  };
}

export default async function AppealReviewPage({ params }: AppealReviewPageProps) {
  const appeal = getAppealById(params.appealId);

  if (!appeal) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error: Appeal Not Found</AlertTitle>
          <AlertDescription>
            The appeal you are trying to review could not be found.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/appeals/in-progress">Go to Appeals In Progress</Link>
        </Button>
      </div>
    );
  }

  const claim = getClaimById(appeal.claimId);
  if (!claim) {
     return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error: Original Claim Not Found</AlertTitle>
          <AlertDescription>
            The original claim associated with this appeal (ID: {appeal.claimId}) could not be found.
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
