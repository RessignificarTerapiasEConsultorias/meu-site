/* Ressignificar CRM · recebe o aviso mandado pelo servidor e mostra no celular. Não guarda páginas nem dados. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("push", function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  e.waitUntil(self.registration.showNotification(d.titulo || "Ressignificar CRM", {
    body: d.corpo || "", tag: d.tag || "crm", renotify: true, icon: "img/crm-icone-192.png", badge: "img/crm-icone-192.png", data: { url: d.url || "whatsapp.html?aba=conversas" }
  }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || "whatsapp.html?aba=conversas", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (lista) {
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].url.indexOf("/whatsapp.html") > -1 && "focus" in lista[i]) { lista[i].postMessage({ crmAbrir: url }); return lista[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
