self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          url: data.url
        }
      };
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (e) {
      console.error('Error processing push event:', e);
      // Fallback
      event.waitUntil(
        self.registration.showNotification('Nueva actualización', {
          body: event.data.text()
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if window is already open and focus it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
