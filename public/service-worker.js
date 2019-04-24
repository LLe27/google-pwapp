/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v2';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/offline.html'
];

/*
 * Precache offline page
 * Install event now opens the cache with `caches.open()` and provides a cache name.
 * Providing a cache name allows us to verison files, or seperate data from the cached
 * resources so that we can easily update one but not affect the other. Once the cache
 * is open, we can then call `cache.addAll()`, which takes a list of URLs, fetches them
 * from the server and adds the response to the cache. Note that `cache.addAll()` will reject
 * if any of the individual requests fail. That means you're guranteed that, if the install
 * step succeeds, your cache will bein a consistent state. But, if it fails for some reason, 
 * it will automatically try again the next time the service worker starts up.
 */
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

/*
 * Clean-up old offline pages
 * We'll use the `activate` event to clean up any old data in our cache. This code ensures that
 * your service worker updates its cache whenever any of the app shell files change. In Order for this
 * to work, you'd need to increment the `CACHE_NAME` variable at the top of your service worker file.
 * 
 * The updated service worker takes control immediately because our `install` event finishes with
 * `self.skipWaiting()`, and the `activate` event finishes with `self.clients.claim()`. Without those,
 * the old service worker would continue to control the page as long as there is a tab open to the page.
 */
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Remove old cache', key);
          return caches.delete(key);
        }
      }))
    })
  )

  self.clients.claim();
});

/*
 * Handle failed network requests
 * Finally, we need to handle `fetch` events. We're going to use a network, falling back to cache 
 * strategy. The service worker will first try to fetch the resource from the network, if that fails,
 * it will return the offline page from the cache.
 * 
 * The `fetch` handler only needs to handle page navigations, so other requests can be dumped out of the
 * handler and will be dealth with normally by the browser. But, if the request `.mode` is `navigate`,
 * use `fetch` to try to get the item fromt he network. If it fails, the `catch` handler opens the cache
 * with `caches.open(CACHE_NAME)` and uses `cache.match('offline.html')` to get the precached offline page.
 * The result is then passed back to the browser using `evt.respondWith()`.
 */
self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // CODELAB: Add fetch event handler here.
  if (evt.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }
  evt.respondWith(
      fetch(evt.request)
          .catch(() => {
            return caches.open(CACHE_NAME)
                .then((cache) => {
                  return cache.match('offline.html');
                });
          })
  );

});
