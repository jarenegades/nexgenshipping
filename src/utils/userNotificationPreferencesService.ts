import { supabase } from './supabaseClient';
import { publicAnonKey, supabaseUrl } from './supabase/info';

const SUPABASE_URL = supabaseUrl;
const USER_NOTIFICATION_PREFERENCES_URL = `${SUPABASE_URL}/functions/v1/user-notification-preferences`;

export interface UserNotificationPreferences {
  order_updates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sms_alerts: boolean;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('User session not found');
  }

  return {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    'Authorization': `Bearer ${accessToken}`,
  };
}

export const userNotificationPreferencesService = {
  async get(): Promise<UserNotificationPreferences | null> {
    const headers = await getAuthHeaders();
    const response = await fetch(USER_NOTIFICATION_PREFERENCES_URL, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to load notification preferences');
    }

    const data = await response.json();
    return data.preferences || null;
  },

  async save(preferences: UserNotificationPreferences): Promise<UserNotificationPreferences> {
    const headers = await getAuthHeaders();
    const response = await fetch(USER_NOTIFICATION_PREFERENCES_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to save notification preferences');
    }

    const data = await response.json();
    return data.preferences;
  },
};
