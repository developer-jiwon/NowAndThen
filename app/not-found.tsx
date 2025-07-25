import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Now & Then',
  description: 'The page you are looking for could not be found. Return to Now & Then countdown timer app.',
  robots: 'noindex',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist. It may have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <p className="mb-2">Looking for something specific?</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/guide" className="text-blue-600 hover:underline">Timer Guide</Link>
              <span className="hidden sm:inline text-gray-300">•</span>
              <Link href="/faq" className="text-blue-600 hover:underline">FAQ</Link>
              <span className="hidden sm:inline text-gray-300">•</span>
              <Link href="/contact" className="text-blue-600 hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}