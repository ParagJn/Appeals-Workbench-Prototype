import AppealForm from '@/components/appeals/AppealForm';
import { getClaimById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AppealSubmissionPageProps {
  params: {
    claimId: string;
  };
}

export default function AppealSubmissionPage({ params }: AppealSubmissionPageProps) {
  const claim = getClaimById(params.claimId);

  if (!claim) {
    return (
      <div className="container mx-auto py-8 text-center">
         <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error: Claim Not Found</AlertTitle>
          <AlertDescription>
            The claim you are trying to appeal could not be found. It might have been removed or the ID is incorrect.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/claims/rejected">Go back to Rejected Claims</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left font-headline">Submit Appeal</h1>
      <p className="text-muted-foreground mb-8 text-center md:text-left">
        You are appealing Claim ID: <span className="font-semibold text-primary">{claim.id}</span> for Policy Holder: <span className="font-semibold text-primary">{claim.policyHolderName}</span>.
      </p>
      <AppealForm claim={claim} />
    </div>
  );
}
