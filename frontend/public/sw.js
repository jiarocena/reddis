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
  try {
    event.notification.close();
  } catch (err) {
    console.error('Error closing notification:', err);
  }

  const urlToOpen = (event.notification && event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';
  
  const targetUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If a window is already open, focus it and navigate to the target URL
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch(function(err) {
        console.error('Error handling notification click:', err);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Pass-through fetch event handler to satisfy PWA criteria
});
