import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/supabase';

export const BUREAU_ADMIN_ACCOUNTS = [
  {
    phone: '03008658360',
    email: 'admin.safdar@sadat.org',
    password: 'admin123',
    name: 'سید محمد صفدر نواز نقوی ترمذی',
    role: 'super_admin' as const
  },
  {
    phone: '03323475431',
    email: 'admin.second@sadat.org',
    password: 'admin123',
    name: 'سید ایڈمن 2',
    role: 'admin' as const
  },
  {
    phone: '03467791264',
    email: 'admin.nadeem@sadat.org',
    password: 'admin123',
    name: 'سید محمد ندیم شاہ',
    role: 'admin' as const
  },
  {
    phone: '03066238755',
    email: 'admin.abid@sadat.org',
    password: 'admin123',
    name: 'سید عابد حسین شاہ',
    role: 'admin' as const
  }
];

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  phone = '',
  role: 'member' | 'admin' = 'member'
): Promise<{ 
  user: any; 
  profile: UserProfile | null; 
  requiresConfirmation?: boolean;
  error: string | null 
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role
        }
      }
    });

    if (error) {
      let friendlyError = error.message;
      if (error.message.includes('already registered')) {
        friendlyError = 'یہ ای میل پہلے سے رجسٹرڈ ہے۔ براہِ کرم لاگ ان کریں۔';
      } else if (error.message.includes('Password should be')) {
        friendlyError = 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔';
      }
      return { user: null, profile: null, error: friendlyError };
    }

    const requiresConfirmation = !data.session && !!data.user;

    const profile: UserProfile = {
      id: data.user?.id || `usr-${Date.now()}`,
      email: data.user?.email || email,
      fullName,
      phone,
      role,
      avatarUrl: null,
      city: null
    };

    // Safe Upsert into public.profiles (Postgres trigger handles this automatically, but client backup ensures it)
    if (data.user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          phone,
          role
        });
      } catch (upsertErr) {
        console.warn('Profile sync fallback note:', upsertErr);
      }
    }

    return { 
      user: data.user, 
      profile, 
      requiresConfirmation,
      error: null 
    };
  } catch (err: any) {
    return { user: null, profile: null, error: err?.message || 'سائن اپ میں مسئلہ پیش آیا' };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Check if it's one of our built-in bureau admin accounts logging in via phone or email
      const matchedAdmin = BUREAU_ADMIN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() || a.phone === email.replace(/[^\d]/g, '')
      );

      if (matchedAdmin && matchedAdmin.password === password) {
        const adminProfile: UserProfile = {
          id: `admin-${matchedAdmin.phone}`,
          email: matchedAdmin.email,
          fullName: matchedAdmin.name,
          phone: matchedAdmin.phone,
          role: matchedAdmin.role,
          avatarUrl: null,
          city: null
        };
        return { user: { id: adminProfile.id, email: adminProfile.email }, profile: adminProfile, error: null };
      }

      return { user: null, profile: null, error: error.message };
    }

    // Fetch profile
    let profile: UserProfile | null = null;
    if (data.user) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profData) {
        profile = {
          id: profData.id,
          email: profData.email,
          fullName: profData.full_name,
          phone: profData.phone,
          role: profData.role,
          avatarUrl: profData.avatar_url,
          city: profData.city
        };
      } else {
        profile = {
          id: data.user.id,
          email: data.user.email || null,
          fullName: data.user.user_metadata?.full_name || 'سید صاحب',
          phone: data.user.user_metadata?.phone || null,
          role: data.user.user_metadata?.role || 'member',
          avatarUrl: null,
          city: null
        };
      }
    }

    return { user: data.user, profile, error: null };
  } catch (err: any) {
    return { user: null, profile: null, error: err?.message || 'لاگ ان نہیں ہو سکا' };
  }
}

export async function signOutUser(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err?.message || null };
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone,
        role: data.role,
        avatarUrl: data.avatar_url,
        city: data.city
      };
    }

    return {
      id: session.user.id,
      email: session.user.email || null,
      fullName: session.user.user_metadata?.full_name || 'صارف',
      phone: session.user.user_metadata?.phone || null,
      role: session.user.user_metadata?.role || 'member',
      avatarUrl: null,
      city: null
    };
  } catch (e) {
    return null;
  }
}
