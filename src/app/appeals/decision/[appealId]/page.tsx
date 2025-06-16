import DecisionDisplayClient from '@/components/appeals/DecisionDisplayClient';
import { getAppealById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DecisionPageProps {
  params: {
    appealId: string;
  };
}

export default function DecisionPage({ params }: DecisionPageProps) {
  const appeal = getAppealById(params.appealId);

  if (!appeal || (appeal.status !== 'Approved' && appeal.status !== 'Rejected' && appeal.status !== 'Info Requested')) {
     let message = "The appeal decision could not be found or is not yet finalized.";
     if (appeal && appeal.status !== 'Approved' && appeal.status !== 'Rejected') {
       message = `This appeal (ID: ${appeal.id}) is still in status '${appeal.status}'. A final decision has not been made.`;
     }
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Decision Not Available</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/appeals/in-progress">View In Progress Appeals</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <DecisionDisplayClient appeal={appeal} />
    </div>
  );
}
