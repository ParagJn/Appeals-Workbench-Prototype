import RejectedClaimsClient from '@/components/claims/RejectedClaimsClient';

export default function RejectedClaimsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left font-headline">Rejected Claims</h1>
      <RejectedClaimsClient />
    </div>
  );
}
