export const metadata = {
  title: "Offline - Now & Then",
  description: "You appear to be offline. Please reconnect to use all features.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold text-[#3A5A38]">You’re offline</h1>
        <p className="mt-2 text-gray-600">
          Please check your internet connection. Some features may be unavailable until you’re back online.
        </p>
        <a
          href="/"
          className="inline-block mt-4 rounded-md border border-[#4E724C] text-[#4E724C] px-4 py-2 hover:bg-[#4E724C] hover:text-white transition"
        >
          Retry Home
        </a>
      </div>
    </main>
  );
}


