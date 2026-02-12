'use client';

import Link from "next/link";

function StatusBar() {
  return (
    <div className="status-bar">
      {/* <span>9:41</span> */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
        {/* <span className="ml-2">📶</span>
        <span>🔋</span> */}
      </div>
    </div>
  );
}

export default function TermsAndConditions() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link href="/settings" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-title">Terms & Conditions</h1>
          <div className="w-9"></div>
        </div>
        
        {/* Terms Content */}
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
              <p>While we strive for accuracy, the app's disease detection capabilities are not 100% accurate. Users should consult with agricultural experts for definitive diagnosis and treatment recommendations.</p>
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
  );
}