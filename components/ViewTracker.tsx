import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { RE_API } from '../constants/realestate';

// One page-view counter for the whole app: every route change posts a short key
// to our own server. No third-party analytics, and a failed post is ignored so
// counting can never affect what the user sees.
//
// Keys look like: home · coupons · item:123 · learn:burj-khalifa
function keyOf(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) return 'home';
  return clean.replace(/\//g, ':').slice(0, 60).replace(/[^a-zA-Z0-9:_-]/g, '');
}

export default function ViewTracker() {
  const pathname = usePathname();
  const last = useRef<string>('');

  useEffect(() => {
    const key = keyOf(pathname || '');
    if (!key || key === last.current) return; // ignore re-renders of the same screen
    last.current = key;
    fetch(`${RE_API}/api/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
