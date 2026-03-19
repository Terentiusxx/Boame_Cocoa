import { Suspense } from 'react';
import ContactClient from '@/components/pages/ContactClient';

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactClient />
    </Suspense>
  );
}
