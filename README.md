## google-pwapp
A fast, reliable, integrated and engaging pwapp developed using Google's code labs documentation.

### Basic Offline Experience
#### Progressive Web App techniques:
- Use responsive design, so it works on both desktop and mobile.
- Be fast, using a service worker to precache the app resources (HTML, CSS, Javascript, images, etc) needed to run, and cache the weather data at runtime to improve performance.
- Be installable, using a web app manifest and the `beforeinstallprompt` event to notify the user it's installable.

#### Key learning points:
- How to create and add a web app manifest.
- How to provide a simple offline experience.
- How to provide a full offline experience.
- How to make you rapp installable.

#### Install Event (Precache offline page)
Our `install` event now opens the cache with `caches.open()` and provides a cache name. Providing a cache name allows us to version files, or separate data from the cached resources so that we can easily update one but not affect the other.

Once the cache is open, we can then call `cache.addAll()`, which takes a list of URLs, fetches them from the server and adds the response to the cache. Note that `cache.addAll()` will reject if any of the individual requests fail. That means you're guaranteed that, if the install step succeeds, you cache will be in a consistent state. But, if it fails for some reason, it will automatically try again the next time the service worker starts up.

#### Activate Event (Clean-up old offline pages)
We'll use the `activate` event to clean up any old data in our cache. This code ensures that your service worker updates its cache whenever any of the app shell files change. In order for this to work, you'd need to increment the `CACHE_NAME` variable at the top of your service worker file.<br>
The updated service worker takes control immediately because our `install` event finishes with `self.skipWaiting()`, and the `activate` event finishes with `self.clients.claim()`. Without those, the old service worker would continue to control the page as long as there is a tab open to the page.

#### Fetch Event (Handle failed network requests)
And finally, we need to handle `fetch` events. We're going to use a [network, falling back to cache strategy](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache). The service worker will first try to fetch the resource from the network, if that fails, it will return the offline page from the cache.

The `fetch` handler only needs to handle page navigations, so other requests can be dumped out of the handler and will be dealt with normally by the browser. But, if the request `.mode` is `navigate`, use `fetch` to try to get the item from the network. If it fails, the `catch` handler opens the cache with `caches.open(CACHE_NAME)` and uses `cache.match('offline.html')` to get the precached offline page. The result is then passed back to the browser using `evt.respondWith()`.

> Wrapping the `fetch` call in `evt.respondWith()` prevents the browsers default fetch handling and tells the browser we want to handle the response ourselves. If you don't call `evt.respondWith()` inside of a `fetch` handler, you'll just get the default network behavior.

#### Tips for testing service workers
- ***Offline*** - When checked simulates an offline experience and prevents any requests from going to the network.
- ***Update on reload*** - When checked will get the latest service worker, install it, and immediately activate it.
- ***Bypass for network*** - When checked requests bypass the service worker and are sent directly to the network.

#### Additional tips
- Clear all saved data (localStorage, indexedDB data, cached files) and remove any service workers under Application > Clear storage.
- Once a service worker has been unregistered, it may remain listed until its containing browser window is closed.
- If multiple windows to your app are open, a new service worker will not take effect until all windows have been reloaded and updated to the latest service worker.
- Unreigstering a service worker does not clear the cache!
- If a service worker exsists and a new service worker is registered, the new service worker won't take control until the page is reloaded, unless you [take immediate control](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim).

### Full Offline Experience
> Designing for offline-first can drastically improve the performance of your web app by reducing the number of network requests made by your app, instead resources can be precached and served directly from the local cache. Even with the fastest network connection, serving from the local cache will be faster!

###### Code Labs Link
https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp/

###### Additional Resources
https://developers.google.com/web/fundamentals/
https://developers.google.com/web/tools/workbox/
https://developers.google.com/web/tools/chrome-devtools/?utm_source=dcc&utm_medium=redirect&utm_campaign=2018Q2
