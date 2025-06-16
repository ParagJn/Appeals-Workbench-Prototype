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
import { ClipboardEdit, Info } from 'lucide-react';
import type { Claim } from '@/types';
import { getRejectedClaims } from '@/lib/data';
import { format } from 'date-fns';

export default function RejectedClaimsClient() {
  const [rejectedClaims, setRejectedClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setRejectedClaims(getRejectedClaims());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <p>Loading claims...</p>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Your Rejected Claims</CardTitle>
        <CardDescription>
          Below is a list of your claims that have been rejected. You can start an appeal process by clicking the 'Appeal' button.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rejectedClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="w-16 h-16 text-primary mb-4" />
            <p className="text-xl font-semibold">No Rejected Claims Found</p>
            <p className="text-muted-foreground">You currently have no rejected claims eligible for appeal.</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your recently rejected claims.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Policy Holder</TableHead>
                <TableHead>Rejection Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Rejection Date</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejectedClaims.map((claim) => (
                <TableRow key={claim.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <Badge variant="secondary">{claim.id}</Badge>
                  </TableCell>
                  <TableCell>{claim.policyHolderName}</TableCell>
                  <TableCell className="max-w-xs truncate">{claim.rejectionReason}</TableCell>
                  <TableCell className="text-right">${claim.claimAmount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(claim.rejectionDate), 'MM/dd/yyyy')}</TableCell>
                  <TableCell className="text-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/appeals/submit/${claim.id}`}>
                        <ClipboardEdit className="mr-2 h-4 w-4" />
                        Appeal
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
