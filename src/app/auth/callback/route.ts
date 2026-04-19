import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

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

  let sessionUser = null;
  let debug = 'init';

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      sessionUser = data.user;
      debug = 'exchanged';
    } else if (error) {
      const { data: { user } } = await supabase.auth.getUser();
      sessionUser = user;
      debug = `exchange_fail_${error.message}`;
    }
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    sessionUser = user;
    debug = 'no_code_check_user';
  }

  if (sessionUser) {
    // 1. Get Assurance Level
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    // 2. Fetch all factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factors?.all?.some(f => f.status === 'verified');

    // 3. Check our internal database flag
    const { data: settings } = await supabase
      .from('user_settings')
      .select('two_factor_enabled')
      .eq('user_id', sessionUser.id)
      .maybeSingle();

    const isLevel2 = aalData?.currentLevel === 'aal2';
    const dbFlag = settings?.two_factor_enabled === true;
    
    debug += `|aal:${aalData?.currentLevel}|factors:${hasVerifiedTotp}|db:${dbFlag}`;

    if ((hasVerifiedTotp || dbFlag) && !isLevel2) {
      return NextResponse.redirect(`${origin}/login?mfa=true&debug_auth=${encodeURIComponent(debug)}`);
    }
    
    return NextResponse.redirect(`${origin}${next}?debug_auth=${encodeURIComponent(debug)}`);
  }

  return NextResponse.redirect(`${origin}/login?no_user=true&debug_auth=${encodeURIComponent(debug)}`);
}
