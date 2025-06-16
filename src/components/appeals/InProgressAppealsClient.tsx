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
import { Eye, Info, Hourglass } from 'lucide-react';
import type { Appeal } from '@/types';
import { getAppeals } from '@/lib/data';
import { format } from 'date-fns';

export default function InProgressAppealsClient() {
  const [inProgressAppeals, setInProgressAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allAppeals = getAppeals();
    const filteredAppeals = allAppeals.filter(appeal => 
      appeal.status === 'Pending Validation' || 
      appeal.status === 'Needs Agent Review' ||
      appeal.status === 'Info Requested'
    );
    setInProgressAppeals(filteredAppeals);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <p>Loading appeals...</p>;
  }

  const getStatusBadgeVariant = (status: Appeal['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pending Validation':
        return 'default'; // Primary color
      case 'Needs Agent Review':
        return 'secondary'; // Muted color
      case 'Info Requested':
        return 'outline'; 
      default:
        return 'default';
    }
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Current Appeals</CardTitle>
        <CardDescription>
          This list shows appeals that are currently being processed or require further action.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inProgressAppeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Hourglass className="w-16 h-16 text-primary mb-4" />
            <p className="text-xl font-semibold">No Appeals In Progress</p>
            <p className="text-muted-foreground">There are no appeals currently awaiting processing.</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of appeals currently in progress.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Appeal ID</TableHead>
                <TableHead>Claim ID</TableHead>
                <TableHead>Policy Holder</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inProgressAppeals.map((appeal) => (
                <TableRow key={appeal.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                     <Badge variant="default">{appeal.id}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{appeal.claimId}</Badge>
                  </TableCell>
                  <TableCell>{appeal.policyHolderName}</TableCell>
                  <TableCell>{format(new Date(appeal.submissionDate), 'MM/dd/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(appeal.status)}>{appeal.status}</Badge>
                  </TableCell>
                  <TableCell>{appeal.assignedAgent || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/appeals/review/${appeal.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View/Review
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
