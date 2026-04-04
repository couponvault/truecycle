/** 
 * Supabase Client Initialization 
 * TrueCycle Cloud Engine 
 */
const SUPABASE_URL = 'https://vsxewsslxgpevddkfqwz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fn9CN0ncRAvdDh8Teh9Fog_-FVk_zJ3';

// Initialize the client via the CDN-loaded supabase object
// SDK global is 'supabase', our instance will be 'tcCloud'
const tcCloud = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!tcCloud) {
    console.error("TrueCycle Error: Supabase client script not loaded!");
} else {
    console.log("TrueCycle Cloud: Database connection initialized.");
}
