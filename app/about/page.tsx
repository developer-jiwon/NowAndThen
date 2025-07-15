import Link from "next/link";

export default function About() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-4 text-sm text-gray-500 hover:underline">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-4">About Now & Then</h1>
      <p className="mb-2">Now & Then helps you track important moments in your life with beautiful, customizable countdown cards. Whether it’s a birthday, a big project, or a personal goal, you can easily create, sync, and manage your timers across all your devices.</p>
      <p className="mb-2">Our mission is to make it simple and delightful to remember and celebrate what matters most. Your data is always private and securely synced to your account.</p>
      <p className="mb-2">Perfect for personal milestones, team projects, and global users who value privacy and minimalism.</p>
    </main>
  );
} 