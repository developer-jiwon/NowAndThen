import Link from "next/link";

export default function FAQ() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-4 text-sm text-gray-500 hover:underline">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Is my data safe?</h2>
        <p className="mb-2">Yes. All your timers are securely stored and synced to your account. We never share your data with third parties.</p>
        <h2 className="font-semibold mb-1">Can I use Now & Then without signing in?</h2>
        <p className="mb-2">You can use the service without signing in, but your data may be lost if you clear your browser or switch devices. Signing in is recommended for backup and sync.</p>
        <h2 className="font-semibold mb-1">How do I delete a timer?</h2>
        <p className="mb-2">Click the trash icon on any timer card to delete it. Deleted timers cannot be recovered.</p>
        <h2 className="font-semibold mb-1">How do I contact support?</h2>
        <p>Email us at <a href="mailto:dev.jiwonnie@gmail.com" className="underline">dev.jiwonnie@gmail.com</a></p>
      </div>
    </main>
  );
} 