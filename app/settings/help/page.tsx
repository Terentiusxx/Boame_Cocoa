'use client';

import Link from "next/link";
import { useState } from "react";

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
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

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How accurate is the disease detection?",
    answer: "Our AI model has been trained on thousands of cocoa plant images and achieves approximately 85-90% accuracy. However, results should be verified by agricultural experts."
  },
  {
    question: "What image quality is needed for best results?",
    answer: "For best results, use clear, well-lit photos taken from 6-12 inches away from the affected area. Avoid blurry or darkly lit images."
  },
  {
    question: "Can I use the app offline?",
    answer: "The app requires an internet connection for disease detection as processing is done on our servers. However, you can view your scan history offline."
  },
  {
    question: "How is my data protected?",
    answer: "All uploaded images and personal data are encrypted and stored securely. We follow industry-standard security practices to protect your information."
  },
  {
    question: "What diseases can the app detect?",
    answer: "Currently, the app can detect Black Pod Disease, CCVD, Vascular-Streak Dieback, and several other common cocoa diseases. We're continuously adding new disease types."
  }
];

export default function Help() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add contact form submission logic here
    console.log('Contact form submitted:', contactForm);
    alert('Your message has been sent! We\'ll get back to you soon.');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />
      
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link href="/settings" className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Help</h1>
          <div className="w-9"></div>
        </div>
        
        <div className="px-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 text-xl">📧</span>
                  <span className="font-medium text-blue-900">Contact Support</span>
                </div>
              </button>
              <button className="w-full text-left p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">📱</span>
                  <span className="font-medium text-green-900">App Tutorial</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Frequently Asked Questions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg">
                  <button
                    className="w-full text-left p-4 font-medium text-gray-900 hover:bg-gray-50 transition-colors flex justify-between items-center"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span>{faq.question}</span>
                    <span className={`transform transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Still Need Help?</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Please describe your issue in detail..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}