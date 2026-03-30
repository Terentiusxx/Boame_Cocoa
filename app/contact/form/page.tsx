import { Suspense } from 'react';
import ContactFormClient from '@/components/pages/ContactFormClient';

export default function ContactFormPage() {
  return (
    <Suspense fallback={null}>
      <ContactFormClient />
    </Suspense>
  );
}
