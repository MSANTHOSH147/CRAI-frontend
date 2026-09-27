import {createClient} from "@supabase/supabase-js";
let client=null;
export function getSupabase(){
  if(client) return client;
  const url=import.meta.env.VITE_SUPABASE_URL;
  const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
  if(!url||!key) return null;
  client=createClient(url,key,{realtime:{params:{eventsPerSecond:5}}});
  return client;
}
export function isSupabaseConfigured(){
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
