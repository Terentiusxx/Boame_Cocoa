/**
 * app/expert/profile/privacy-policy/page.tsx
 * Expert settings: Privacy policy
 */
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import ExpertNavbar from '@/components/expert/ExpertNavbar';

export const dynamic = 'force-dynamic';

export default async function ExpertPrivacyPolicy() {
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
            <h1 className="text-xl font-semibold text-brand-text-titles">Privacy Policy</h1>
            <div className="w-9"></div>
          </div>

          <div className="px-6">
            <div className="bg-white rounded-lg p-6 text-sm text-gray-700 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, upload images for disease detection, or contact us for support.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Provide disease detection services</li>
                  <li>Improve our machine learning algorithms</li>
                  <li>Send you notifications about scan results</li>
                  <li>Provide customer support</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Information Sharing</h3>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Image Data</h3>
                <p>Images uploaded for disease detection are processed using machine learning models. With your consent, these images may be used to improve our detection algorithms.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
                <p>You have the right to access, update, or delete your personal information. You may also opt out of certain data collection and processing activities.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@cocoaapp.com</p>
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
