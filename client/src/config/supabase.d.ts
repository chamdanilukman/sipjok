import { SupabaseClient } from '@supabase/supabase-js';

export const supabase: SupabaseClient;
export const IS_MOCK_MODE: boolean;
export const DEV_AUTO_LOGIN: null;

export function getCurrentUserId(): Promise<string>;
export function isAuthenticated(): Promise<boolean>;
export function signIn(email: string, password: string): Promise<any>;
export function signOut(): Promise<void>;

export default supabase;
