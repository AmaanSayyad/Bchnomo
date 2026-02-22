import { redirect } from 'next/navigation';

/**
 * Root path redirects to the trade page so /trade is the default landing experience.
 */
export default function RootPage() {
  redirect('/trade');
}
