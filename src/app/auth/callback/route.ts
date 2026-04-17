import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    
    // 1. Try the exchange
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    // 2. Check if we actually have a session now (regardless of error)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!error || session) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error('Handshake Debug:', error);
  }

  // 3. Last resort check
  const cookieStore = await cookies();
  const hasSession = cookieStore.getAll().some(c => c.name.includes('auth-token') || c.name.includes('sb-'));
  
  if (hasSession) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
