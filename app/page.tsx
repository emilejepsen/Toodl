import { redirect } from 'next/navigation';

export default function HomePage() {
  // For nu redirecter vi til login
  redirect('/login');
}
