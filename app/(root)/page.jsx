import { redirect } from 'next/navigation';

// This is for the deployment of the application. Delete once done.
export default function Home() {
  redirect('/dashboard');
}
