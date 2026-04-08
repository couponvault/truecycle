/** 
 * Supabase Client Initialization 
 * Prime Device Cloud Engine 
 */
const SUPABASE_URL = 'https://vsxewsslxgpevddkfqwz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fn9CN0ncRAvdDh8Teh9Fog_-FVk_zJ3';

// Initialize the client via the CDN-loaded supabase object
// SDK global is 'supabase', our instance will be 'pdCloud'
const pdCloud = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!pdCloud) {
    console.error("Prime Device Error: Supabase client script not loaded!");
} else {
    console.log("Prime Device Cloud: Database connection initialized.");
}

