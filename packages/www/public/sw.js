if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let n=Promise.resolve();return t[e]||(n=new Promise((async n=>{if("document"in self){const t=document.createElement("script");t.src=e,document.head.appendChild(t),t.onload=n}else importScripts(e),n()}))),n.then((()=>{if(!t[e])throw new Error(`Module ${e} didn’t register its module`);return t[e]}))},n=(n,t)=>{Promise.all(n.map(e)).then((e=>t(1===e.length?e[0]:e)))},t={require:Promise.resolve(n)};self.define=(n,s,i)=>{t[n]||(t[n]=Promise.resolve().then((()=>{let t={};const a={uri:location.origin+n.slice(1)};return Promise.all(s.map((n=>{switch(n){case"exports":return t;case"module":return a;default:return e(n)}}))).then((e=>{const n=i(...e);return t.default||(t.default=n),t}))})))}}define("./sw.js",["./workbox-7288c796"],(function(e){"use strict";importScripts("worker-YnmDot-UvfklgptzLSInt.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/YnmDot-UvfklgptzLSInt/_buildManifest.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/YnmDot-UvfklgptzLSInt/_ssgManifest.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/146.dac16a378017a3b908e1.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/146.dac16a378017a3b908e1.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/254.0842e7aa6d62929bbaf3.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/254.0842e7aa6d62929bbaf3.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/351.f3f049b23fa48975a364.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/351.f3f049b23fa48975a364.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/790.843000b02be813787049.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/790.843000b02be813787049.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/877-0b732eab4d2ed323649e.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/877-0b732eab4d2ed323649e.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/framework-6904c37ecf5b200e4e2e.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/framework-6904c37ecf5b200e4e2e.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/main-1622cb38e93933783343.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/main-1622cb38e93933783343.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/_app-f969d07b144252b4e453.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/_app-f969d07b144252b4e453.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/_error-1cd1e11cd5e9c8211770.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/_error-1cd1e11cd5e9c8211770.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/index-c60a1451851b4b489345.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/index-c60a1451851b4b489345.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/k-53de1c8919efff3ddeba.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/k-53de1c8919efff3ddeba.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/k/%5Bid%5D-5ade9f9533ba828633d6.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/k/%5Bid%5D-5ade9f9533ba828633d6.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/r-5cd32ab311ef7c240ff8.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/r-5cd32ab311ef7c240ff8.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/r/%5Bid%5D-bc8004d9c1054570a9b8.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/r/%5Bid%5D-bc8004d9c1054570a9b8.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/shhh-5e23900e30fd14c9f388.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/shhh-5e23900e30fd14c9f388.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/shhhmp-63c0186c3186516bdfba.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/shhhmp-63c0186c3186516bdfba.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/signout-a8947582f064b3d8c5e6.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/signout-a8947582f064b3d8c5e6.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/sponsorware-0ea8113fd25cf64bf199.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/sponsorware-0ea8113fd25cf64bf199.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/u-4e2e7f6288f3059347cb.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/u-4e2e7f6288f3059347cb.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/u/%5Bid%5D-22351fd7f99494553332.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/pages/u/%5Bid%5D-22351fd7f99494553332.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/polyfills-a40ef1678bae11e696dba45124eadd70.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/webpack-a8691967754e8844a343.js",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/chunks/webpack-a8691967754e8844a343.js.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/css/188c96206215c999865a.css",revision:"YnmDot-UvfklgptzLSInt"},{url:"/_next/static/css/188c96206215c999865a.css.map",revision:"YnmDot-UvfklgptzLSInt"},{url:"/android-chrome-192x192.png",revision:"57c9c4cd91d24d48b7ffdda0768fd225"},{url:"/android-chrome-512x512.png",revision:"8d2454e6cf551f8ca1e1d5670b13a8d1"},{url:"/android-chrome-maskable-192x192.png",revision:"71c93ce0b34d2fbb4c6654a9131a3d9d"},{url:"/android-chrome-maskable-512x512.png",revision:"4265b8c09997b16ac1493500b43f3755"},{url:"/android-chrome-maskable-beta-512x512.png",revision:"145800cf2381faf1c0f4a61c29a88448"},{url:"/apple-touch-icon.png",revision:"8081d08be3673ec33dbeecab06706b2b"},{url:"/favicon-16x16.png",revision:"ac17d75b1ee007781212853a57b88285"},{url:"/favicon-32x32.png",revision:"360bc7cd4706c0657917f3b78fed6b71"},{url:"/favicon.ico",revision:"b2bf6bb7b4d0234f3e6df44fd7d5707e"},{url:"/flat.png",revision:"e0460141713b5c94104ce19b36c4b462"},{url:"/icons/Redo.svg",revision:"6196f61a2053ff606d5746eb3ab380e3"},{url:"/icons/Trash.svg",revision:"5f2c42a17b7d8459f2e556b6209a61c6"},{url:"/icons/Undo.svg",revision:"24de701870630f51132f9bed3f18ee8f"},{url:"/icons/grab.svg",revision:"a1ca9e5c31d1edd2558ab075f72fde4e"},{url:"/icons/pointer.svg",revision:"dff260f896fe23adb83341639fdf93be"},{url:"/icons/resize.svg",revision:"0a3cb701d15731e25919783801d18f95"},{url:"/images/hello.mp4",revision:"b716f249cc6c781c91b0ac9dc23423b3"},{url:"/manifest.json",revision:"3e4cd02739cceee25488c97ca2ed59da"},{url:"/vercel.svg",revision:"4b4f1876502eb6721764637fe5c41702"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:n,event:t,state:s})=>n&&"opaqueredirect"===n.type?new Response(n.body,{status:200,statusText:"OK",headers:n.headers}):n}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const n=e.pathname;return!n.startsWith("/api/auth/")&&!!n.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
//# sourceMappingURL=sw.js.map
