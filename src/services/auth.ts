import { supabase } from './supabase';

/**
 * Send a 6-digit OTP to the user's email.
 *
 * For new users, name/phone/gender are stored in the
 * Supabase Auth user metadata.
 */
export async function sendOtp(
  email: string,
  name?: string,
  phone?: string,
  gender?: string,
) {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      data: {
        name: name?.trim() || '',
        phone: phone?.trim() || '',
        gender: gender || 'Male',
      },
    },
  });

  if (error) {
    console.log('OTP SEND ERROR:', {
      message: error.message,
      name: error.name,
      status: error.status,
    });

    throw error;
  }

  console.log('OTP sent successfully to:', cleanEmail);
}

/**
 * Also exported as sendMagicLink for backwards compatibility.
 * Internally uses OTP (the Supabase "magic link" / OTP email flow).
 */
export const sendMagicLink = sendOtp;

/**
 * Verify the 6-digit email OTP.
 *
 * On success, Supabase creates/returns the authenticated session.
 */
export async function verifyOtp(
  email: string,
  token: string,
) {
  const cleanEmail = email.trim();
  const cleanToken = token.trim();

  if (!cleanEmail) {
    throw new Error('Email address is required.');
  }

  if (!cleanToken) {
    throw new Error('Please enter the OTP.');
  }

  if (!/^\d{6}$/.test(cleanToken)) {
    throw new Error('OTP must be a 6-digit code.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'email',
  });

  if (error) {
    console.log('OTP VERIFY ERROR:', {
      message: error.message,
      name: error.name,
      status: error.status,
    });

    throw error;
  }

  console.log('OTP verified successfully.');

  return data.session;
}

/**
 * Handle an incoming deep link URL from Supabase Auth.
 *
 * Supabase may send a magic-link style URL to cojourney://auth/callback
 * with either a code (PKCE) or a token in the hash/query string.
 * This function extracts and exchanges the code or sets the session
 * from the access_token / refresh_token fragment.
 *
 * NOTE: With OTP-only flow, this is a safety net in case the Supabase
 * project is configured to send link-based emails rather than 6-digit codes.
 */
export async function handleAuthUrl(url: string): Promise<void> {
  if (!url) return;

  console.log('handleAuthUrl called with:', url);

  try {
    // Parse the URL — Supabase PKCE sends ?code=... in the query string
    const urlObj = new URL(url);

    // PKCE code exchange (most common for link-based OTPs)
    const code = urlObj.searchParams.get('code');
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.log('Code exchange error:', error.message);
      } else {
        console.log('Code exchange successful, user:', data.session?.user?.email);
      }
      return;
    }

    // Hash-fragment token (legacy Supabase implicit flow)
    // URL format: cojourney://auth/callback#access_token=...&refresh_token=...
    const hash = urlObj.hash?.replace('#', '');
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.log('setSession error:', error.message);
        } else {
          console.log('Session set from deep link tokens.');
        }
        return;
      }
    }

    console.log('No auth tokens found in URL:', url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('handleAuthUrl parse error:', message);
  }
}

/**
 * Get the currently authenticated Supabase session.
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('GET SESSION ERROR:', error);
    throw error;
  }

  return session;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('SIGN OUT ERROR:', error);
    throw error;
  }
}