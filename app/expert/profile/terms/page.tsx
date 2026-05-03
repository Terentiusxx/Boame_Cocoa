/**
 * app/expert/profile/terms/page.tsx
 * Expert settings: Terms & Conditions
 */
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import ExpertNavbar from '@/components/expert/ExpertNavbar';

export const dynamic = 'force-dynamic';

export default async function ExpertTermsAndConditions() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;
  if (!token || !expertId) redirect(EXPERT_ROUTES.LOGIN);

  return (
    <>
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
        <div className="pb-6">
          <div className="flex items-center justify-between py-4 mb-6 px-6">
            <Link
              href={EXPERT_ROUTES.PROFILE}
              className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
            >
              <span className="text-xl">‹</span>
            </Link>
            <h1 className="text-xl font-semibold text-brand-text-titles">Terms & Conditions</h1>
            <div className="w-9"></div>
          </div>

          <div className="px-6">
            <div className="bg-white rounded-lg p-6 text-sm text-gray-700 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p>By using the Cocoa Disease Detection app, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Use of the Application</h3>
                <p>This application is designed to help identify potential cocoa plant diseases through image analysis. The results provided are for informational purposes only and should not replace professional agricultural advice.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Data Collection</h3>
                <p>We may collect images, location data, and usage information to improve our disease detection algorithms. All data is handled in accordance with our Privacy Policy.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Accuracy Disclaimer</h3>
                <p>While we strive for accuracy, the app&apos;s disease detection capabilities are not 100% accurate. Users should consult with agricultural experts for definitive diagnosis and treatment recommendations.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. User Responsibilities</h3>
                <p>Users are responsible for ensuring they have the rights to upload images and that the content does not violate any laws or third-party rights.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6. Limitation of Liability</h3>
                <p>The app and its developers shall not be liable for any damages arising from the use of this application, including but not limited to crop loss or financial damages.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7. Updates to Terms</h3>
                <p>These terms may be updated from time to time. Continued use of the application constitutes acceptance of the updated terms.</p>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">Last updated: February 12, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExpertNavbar />
    </>
  );
}
