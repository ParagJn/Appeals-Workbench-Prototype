"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Send, FileText, Hourglass } from 'lucide-react';
import type { Claim, Appeal } from "@/types";
import { addAppeal, BPO_AGENTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const appealFormSchema = z.object({
  claimId: z.string(),
  policyHolderName: z.string(),
  appealReason: z.string().min(10, {
    message: "Appeal reason must be at least 10 characters.",
  }).max(2000, { message: "Appeal reason must not exceed 2000 characters."}),
  supportingDocuments: z.any().optional(), // Using any for FileList, validation can be enhanced
});

type AppealFormValues = z.infer<typeof appealFormSchema>;

interface AppealFormProps {
  claim: Claim;
}

export default function AppealForm({ claim }: AppealFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const form = useForm<AppealFormValues>({
    resolver: zodResolver(appealFormSchema),
    defaultValues: {
      claimId: claim.id,
      policyHolderName: claim.policyHolderName,
      appealReason: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  function onSubmit(data: AppealFormValues) {
    const newAppealId = `APL-${Date.now().toString().slice(-6)}`;
    const assignedAgent = BPO_AGENTS[Math.floor(Math.random() * BPO_AGENTS.length)];
    
    const appealData: Appeal = {
      id: newAppealId,
      claimId: data.claimId,
      policyHolderName: data.policyHolderName,
      appealReason: data.appealReason,
      supportingDocuments: selectedFiles.map(file => ({ name: file.name })),
      submissionDate: new Date().toISOString(),
      status: "Pending Validation",
      assignedAgent: assignedAgent,
    };

    addAppeal(appealData);

    toast({
      title: "Appeal Submitted Successfully!",
      description: (
        <div>
          <p>Your Appeal ID: <span className="font-semibold text-accent">{newAppealId}</span></p>
          <p>Assigned to: {assignedAgent}</p>
          <p>Status: Pending Validation</p>
        </div>
      ),
      variant: 'default', 
      duration: 7000,
    });
    
    router.push(`/appeals/review/${newAppealId}`);
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Appeal Details</CardTitle>
        <CardDescription>
          Please provide the reason for your appeal and upload any supporting documents.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="claimId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="policyHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Holder Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appealReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Appeal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain clearly why you believe the claim decision should be overturned..."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed explanation for your appeal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supportingDocuments"
              render={({ field }) => ( 
                <FormItem>
                  <FormLabel>Supporting Documents (Optional)</FormLabel>
                  <FormControl>
                     <Input 
                        id="supportingDocuments" 
                        type="file" 
                        multiple 
                        onChange={handleFileChange}
                        className="pt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                  </FormControl>
                  <FormDescription>
                    Upload any documents that support your appeal (e.g., medical records, invoices, photos). Max 5 files, 5MB each. (Simulated)
                  </FormDescription>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Selected files:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {selectedFiles.map(file => <li key={file.name}><FileText className="inline h-4 w-4 mr-1"/>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>)}
                      </ul>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Hourglass className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Submit Appeal
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
