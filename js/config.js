// Live multiplayer settings. Paste your Supabase Project URL and anon/publishable key here.
// The publishable key is meant to be public. NEVER put the service_role / secret key in this file.
// Leave both empty to run the game in solo mode.
window.NS_CONFIG = {
  SUPABASE_URL: "https://gmxuuxigogbxrcuyqdta.supabase.co",
  SUPABASE_KEY: "sb_publishable_k2zpy-3Ypi8_Vs1iLohvJg_0xwtfmQD",
  MAX_PLAYERS_SHOWN: 20,
  // Players per room. Each city fills room 1, then room 2, and so on. Smaller rooms = fewer realtime messages
  // (the free Supabase plan allows 100 messages a second across the whole project).
  ROOM_SIZE: 8
};
