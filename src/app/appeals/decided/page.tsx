import DecidedAppealsClient from '@/components/appeals/DecidedAppealsClient';

export default function DecidedAppealsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left font-headline">Decided Appeals</h1>
      <DecidedAppealsClient />
    </div>
  );
}
