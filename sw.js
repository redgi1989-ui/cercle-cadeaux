// Service worker minimal : permet d'installer l'appli sur l'écran d'accueil.
// Les données viennent toujours en direct de Supabase.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
