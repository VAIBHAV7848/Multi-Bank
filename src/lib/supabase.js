import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dmrttdhxjowzsyustwhe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wydIMhRfE1LTXQVKHwqeLg_JpUFN1ze";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
