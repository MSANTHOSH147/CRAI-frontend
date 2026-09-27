import {getSupabase} from "./supabase.js";
export function subscribeToTables(tables,onChange){
  const supabase=getSupabase();
  if(!supabase) return ()=>{};
  const channels=tables.map(table=>supabase.channel(`crai-${table}-${Date.now()}-${Math.random()}`)
    .on("postgres_changes",{event:"*",schema:"public",table},onChange).subscribe());
  return ()=>channels.forEach(c=>supabase.removeChannel(c));
}
