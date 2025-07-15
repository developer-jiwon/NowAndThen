import Link from "next/link";

export default function Guide() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-4 text-sm text-gray-500 hover:underline">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-4">How to Use Now & Then</h1>
      <ol className="list-decimal pl-5 mb-4">
        <li className="mb-2"><b>Sign in</b> to sync your timers across devices. Without sign in, your data may be lost.</li>
        <li className="mb-2"><b>Add a timer</b> for any important date or event. Use the form to set a title and date.</li>
        <li className="mb-2"><b>Edit or delete</b> timers anytime. All changes are saved automatically.</li>
        <li className="mb-2"><b>Pin, hide, or reorder</b> timers to organize your dashboard.</li>
        <li className="mb-2"><b>Access from anywhere</b>: Your timers are always available and securely backed up.</li>
      </ol>
      <p>Need help? Contact <a href="mailto:dev.jiwonnie@gmail.com" className="underline">dev.jiwonnie@gmail.com</a></p>
    </main>
  );
} 