if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return n[e]||(s=new Promise((async s=>{if("document"in self){const n=document.createElement("script");n.src=e,document.head.appendChild(n),n.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!n[e])throw new Error(`Module ${e} didn’t register its module`);return n[e]}))},s=(s,n)=>{Promise.all(s.map(e)).then((e=>n(1===e.length?e[0]:e)))},n={require:Promise.resolve(s)};self.define=(s,i,c)=>{n[s]||(n[s]=Promise.resolve().then((()=>{let n={};const a={uri:location.origin+s.slice(1)};return Promise.all(i.map((s=>{switch(s){case"exports":return n;case"module":return a;default:return e(s)}}))).then((e=>{const s=c(...e);return n.default||(n.default=s),n}))})))}}define("./sw.js",["./workbox-7288c796"],(function(e){"use strict";importScripts("worker-7GC0o98q0MDMVfX7oZ8sl.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/7GC0o98q0MDMVfX7oZ8sl/_buildManifest.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/7GC0o98q0MDMVfX7oZ8sl/_ssgManifest.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/351.9fd0cb65d7c1b384ec40.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/351.9fd0cb65d7c1b384ec40.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/735.467132c9efbcf1795a0a.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/735.467132c9efbcf1795a0a.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/830.5c772366e9491ef1e9f8.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/830.5c772366e9491ef1e9f8.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/877-0b732eab4d2ed323649e.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/877-0b732eab4d2ed323649e.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/933.e02aba47ae7b7266a4e0.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/933.e02aba47ae7b7266a4e0.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/framework-6904c37ecf5b200e4e2e.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/framework-6904c37ecf5b200e4e2e.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/main-1622cb38e93933783343.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/main-1622cb38e93933783343.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/_app-6ae16e08a077d60c5eef.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/_app-6ae16e08a077d60c5eef.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/_error-1cd1e11cd5e9c8211770.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/_error-1cd1e11cd5e9c8211770.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/chaos-582606218f7143ba9d46.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/chaos-582606218f7143ba9d46.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/index-8e8448b898c0d9f22e4d.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/index-8e8448b898c0d9f22e4d.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/r-5cd32ab311ef7c240ff8.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/r-5cd32ab311ef7c240ff8.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/r/%5Bid%5D-16ebeced9c098ffc4cca.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/r/%5Bid%5D-16ebeced9c098ffc4cca.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/shhh-3c469f1a3ffc0b8dd10c.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/shhh-3c469f1a3ffc0b8dd10c.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/signout-a8947582f064b3d8c5e6.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/signout-a8947582f064b3d8c5e6.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/sponsorware-e687fb2bd1ed8729e0f3.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/sponsorware-e687fb2bd1ed8729e0f3.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/u-4e2e7f6288f3059347cb.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/u-4e2e7f6288f3059347cb.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/u/%5Bid%5D-22351fd7f99494553332.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/pages/u/%5Bid%5D-22351fd7f99494553332.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/polyfills-a40ef1678bae11e696dba45124eadd70.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/webpack-31a2b5e431be0d14e05f.js",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/chunks/webpack-31a2b5e431be0d14e05f.js.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/css/188c96206215c999865a.css",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/_next/static/css/188c96206215c999865a.css.map",revision:"7GC0o98q0MDMVfX7oZ8sl"},{url:"/android-chrome-192x192.png",revision:"57c9c4cd91d24d48b7ffdda0768fd225"},{url:"/android-chrome-512x512.png",revision:"8d2454e6cf551f8ca1e1d5670b13a8d1"},{url:"/android-chrome-maskable-192x192.png",revision:"71c93ce0b34d2fbb4c6654a9131a3d9d"},{url:"/android-chrome-maskable-512x512.png",revision:"4265b8c09997b16ac1493500b43f3755"},{url:"/android-chrome-maskable-beta-512x512.png",revision:"145800cf2381faf1c0f4a61c29a88448"},{url:"/apple-touch-icon.png",revision:"8081d08be3673ec33dbeecab06706b2b"},{url:"/favicon-16x16.png",revision:"ac17d75b1ee007781212853a57b88285"},{url:"/favicon-32x32.png",revision:"360bc7cd4706c0657917f3b78fed6b71"},{url:"/favicon.ico",revision:"b2bf6bb7b4d0234f3e6df44fd7d5707e"},{url:"/flat.png",revision:"e0460141713b5c94104ce19b36c4b462"},{url:"/icons/Redo.svg",revision:"6196f61a2053ff606d5746eb3ab380e3"},{url:"/icons/Trash.svg",revision:"5f2c42a17b7d8459f2e556b6209a61c6"},{url:"/icons/Undo.svg",revision:"24de701870630f51132f9bed3f18ee8f"},{url:"/icons/grab.svg",revision:"a1ca9e5c31d1edd2558ab075f72fde4e"},{url:"/icons/pointer.svg",revision:"dff260f896fe23adb83341639fdf93be"},{url:"/icons/resize.svg",revision:"0a3cb701d15731e25919783801d18f95"},{url:"/images/hello.mp4",revision:"b716f249cc6c781c91b0ac9dc23423b3"},{url:"/manifest.json",revision:"3e4cd02739cceee25488c97ca2ed59da"},{url:"/vercel.svg",revision:"4b4f1876502eb6721764637fe5c41702"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:i})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
//# sourceMappingURL=sw.js.map
