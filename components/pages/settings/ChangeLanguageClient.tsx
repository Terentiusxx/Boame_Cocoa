'use client';

import Link from 'next/link';
import { useState } from 'react';



interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

export default function ChangeLanguageClient({ backHref = '/settings' }: { backHref?: string }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    console.log('Language changed to:', languageCode);
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
       

      <div className="pb-6">
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link
            href={backHref}
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Language</h1>
          <div className="w-9"></div>
        </div>

        <div className="px-6">
          <div className="bg-white rounded-lg">
            {languages.map((language, index) => (
              <div
                key={language.code}
                className={`flex items-center justify-between py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  index !== languages.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{language.name}</h3>
                  <p className="text-sm text-gray-500">{language.nativeName}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedLanguage === language.code ? 'border-green-600 bg-green-600' : 'border-gray-300'
                  }`}
                >
                  {selectedLanguage === language.code && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              className="w-full py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => alert('Language preference saved!')}
            >
              Save Language Preference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
