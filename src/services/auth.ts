import { supabase } from './supabase';

export async function sendMagicLink(
  email: string,
  name?: string,
  phone?: string,
  gender?: string,
) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'cojourney://auth/callback',
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
        gender: gender || 'Male',
      },
    },
  });

  if (error) {
        console.log('MAGIC LINK ERROR:', error.message);
    throw error;
  }
}

export async function handleAuthUrl(url: string) {
  if (!url || !url.includes('auth/callback')) return null;

  try {
    const hashIdx = url.indexOf('#');
    const queryIdx = url.indexOf('?');

    let paramsStr = '';
    if (hashIdx !== -1) {
      paramsStr = url.substring(hashIdx + 1);
    } else if (queryIdx !== -1) {
      paramsStr = url.substring(queryIdx + 1);
    }

    const params: Record<string, string> = {};
    paramsStr.split('&').forEach((part) => {
      const [k, v] = part.split('=');
      if (k && v) {
        params[k] = decodeURIComponent(v);
      }
    });

    if (params.access_token && params.refresh_token) {
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error) throw error;
      return data.session;
    } else if (params.code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      return data.session;
    }
  } catch (err) {
    console.error('Error handling auth URL:', err);
    throw err;
  }
  return null;
}