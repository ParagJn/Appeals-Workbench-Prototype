
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileX2, Hourglass, CheckCircle2, ArrowRight, Trash2 } from 'lucide-react';
import type { Claim, Appeal } from '@/types';
import { getRejectedClaims, getAppeals, resetApplicationData } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

interface DashboardMetrics {
  totalClaims: number;
  rejectedClaims: number;
  appealsInProgress: number;
  decisionsMade: number;
}

function MetricCard({ title, value, icon: Icon, description, borderColorClass }: { title: string; value: string | number; icon: React.ElementType; description?: string; borderColorClass: string }) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 ${borderColorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClaims: 0,
    rejectedClaims: 0,
    appealsInProgress: 0,
    decisionsMade: 0,
  });

  useEffect(() => {
    const rejectedClaimsList = getRejectedClaims();
    const appealsList = getAppeals();

    // Assuming total claims = rejected claims for this demo, as we only deal with rejected ones.
    // In a real app, this would come from a different source.
    const totalClaims = rejectedClaimsList.length;
    const rejectedClaimsCount = rejectedClaimsList.length;
    const appealsInProgressCount = appealsList.filter(a => a.status === 'Pending Validation' || a.status === 'Needs Agent Review' || a.status === 'Info Requested').length;
    const decisionsMadeCount = appealsList.filter(a => a.status === 'Approved' || a.status === 'Rejected').length;
    
    setMetrics({
      totalClaims: totalClaims, // Placeholder, adjust if you have actual total claims
      rejectedClaims: rejectedClaimsCount,
      appealsInProgress: appealsInProgressCount,
      decisionsMade: decisionsMadeCount,
    });
  }, []);

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      if (window.confirm("Are you sure you want to reset all application data? This will clear localStorage and reload the page.")) {
        resetApplicationData();
        window.location.reload();
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left font-headline">Appeals Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard title="Total Claims Received" value={metrics.totalClaims} icon={FileText} description="Total claims in the system" borderColorClass="border-blue-500" />
        <MetricCard title="Rejected Claims" value={metrics.rejectedClaims} icon={FileX2} description="Claims currently marked as rejected" borderColorClass="border-red-500" />
        <MetricCard title="Appeals In Progress" value={metrics.appealsInProgress} icon={Hourglass} description="Appeals awaiting review or decision" borderColorClass="border-yellow-500" />
        <MetricCard title="Decisions Made" value={metrics.decisionsMade} icon={CheckCircle2} description="Appeals that have been resolved" borderColorClass="border-green-500" />
      </div>

      <div className="text-center mt-12">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/claims/rejected">
            View Rejected Claims & Start Appeal
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="mt-16 p-6 bg-card rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 font-headline">How ClaimFlow Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>View a list of your rejected claims.</li>
          <li>Select a claim and submit an appeal with your reasons and any supporting documents.</li>
          <li>Our system performs an automated validation of your appeal against policy terms and coverage.</li>
          <li>If needed, a BPO agent will review the appeal and automated validation results.</li>
          <li>Receive a final decision on your appeal and see updated metrics on your dashboard.</li>
        </ol>
      </div>

      <Separator className="my-12" />

      <div className="mt-8 p-6 bg-card rounded-lg shadow-md border border-destructive/50">
        <h2 className="text-xl font-semibold mb-4 font-headline text-destructive">Admin Actions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use these actions for testing or resetting the application state.
        </p>
        <Button onClick={handleResetData} variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Reset App Data & Reload
        </Button>
         <p className="text-xs text-muted-foreground mt-2">
          This will clear all claims and appeals data from your browser's local storage and reload the application with the initial sample data.
        </p>
      </div>
    </div>
  );
}

