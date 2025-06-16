"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Eye, Info } from 'lucide-react';
import type { Appeal } from '@/types';
import { getAppeals } from '@/lib/data';
import { format } from 'date-fns';

export default function DecidedAppealsClient() {
  const [decidedAppeals, setDecidedAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allAppeals = getAppeals();
    const filteredAppeals = allAppeals.filter(appeal => 
      appeal.status === 'Approved' || 
      appeal.status === 'Rejected'
    );
    setDecidedAppeals(filteredAppeals);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Info className="w-8 h-8 text-primary mr-2 animate-pulse" />
        <p className="text-muted-foreground">Loading decided appeals...</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Appeal['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Approved':
        return 'default'; // Typically green or primary
      case 'Rejected':
        return 'destructive'; // Typically red
      default:
        return 'secondary';
    }
  };

  const StatusIcon = ({ status }: { status: Appeal['status'] }) => {
    if (status === 'Approved') {
      return <CheckCircle2 className="h-5 w-5 text-accent inline mr-2" />;
    }
    if (status === 'Rejected') {
      return <XCircle className="h-5 w-5 text-destructive inline mr-2" />;
    }
    return null;
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Appeals with Final Decisions</CardTitle>
        <CardDescription>
          This list shows appeals that have been either approved or rejected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {decidedAppeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="w-16 h-16 text-primary mb-4" />
            <p className="text-xl font-semibold">No Decided Appeals</p>
            <p className="text-muted-foreground">There are no appeals with a final decision yet.</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of appeals with final decisions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Appeal ID</TableHead>
                <TableHead>Claim ID</TableHead>
                <TableHead>Policy Holder</TableHead>
                <TableHead>Decision Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decidedAppeals.map((appeal) => (
                <TableRow key={appeal.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                     <Badge variant="outline">{appeal.id}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{appeal.claimId}</Badge>
                  </TableCell>
                  <TableCell>{appeal.policyHolderName}</TableCell>
                  <TableCell>
                    {appeal.finalDecisionDate ? format(new Date(appeal.finalDecisionDate), 'MM/dd/yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(appeal.status)}>
                      <StatusIcon status={appeal.status} />
                      {appeal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{appeal.assignedAgent || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/appeals/decision/${appeal.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Decision
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
