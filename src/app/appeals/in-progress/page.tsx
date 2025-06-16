import InProgressAppealsClient from '@/components/appeals/InProgressAppealsClient';

export default function InProgressAppealsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left font-headline">Appeals In Progress</h1>
      <InProgressAppealsClient />
    </div>
  );
}
