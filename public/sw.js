if (!self.define) {
  const e = (e) => {
      'require' !== e && (e += '.js')
      let s = Promise.resolve()
      return (
        i[e] ||
          (s = new Promise(async (s) => {
            if ('document' in self) {
              const i = document.createElement('script')
              ;(i.src = e), document.head.appendChild(i), (i.onload = s)
            } else importScripts(e), s()
          })),
        s.then(() => {
          if (!i[e]) throw new Error(`Module ${e} didn’t register its module`)
          return i[e]
        })
      )
    },
    s = (s, i) => {
      Promise.all(s.map(e)).then((e) => i(1 === e.length ? e[0] : e))
    },
    i = { require: Promise.resolve(s) }
  self.define = (s, n, r) => {
    i[s] ||
      (i[s] = Promise.resolve().then(() => {
        let i = {}
        const c = { uri: location.origin + s.slice(1) }
        return Promise.all(
          n.map((s) => {
            switch (s) {
              case 'exports':
                return i
              case 'module':
                return c
              default:
                return e(s)
            }
          })
        ).then((e) => {
          const s = r(...e)
          return i.default || (i.default = s), i
        })
      }))
  }
}
define('./sw.js', ['./workbox-ea903bce'], function (e) {
  'use strict'
  importScripts('worker-SlB8WHIYQ6-iZY44JmlAT.js'),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/VerveineRegular.woff',
          revision: '858cc7add1765cbcfb0439e275fd167b',
        },
        {
          url: '/_next/static/SlB8WHIYQ6-iZY44JmlAT/_buildManifest.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/SlB8WHIYQ6-iZY44JmlAT/_ssgManifest.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/245.7470f1d1ceedfdafd81c.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/337.4825e481b2a03315ecb2.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/37bf9728.118a11dd58c3a30f3538.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/380.7306ba288a3edf293371.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/445-feca69d89bd5e26590a0.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/448.ac3c90729698fdf4578a.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/456.bfd833040e90c3598c9f.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/4c8073aa.4da93ffc8af5b5f94841.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/547.d9a37eef3088014e6483.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/58917679.5005afc2b42bde65b10f.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/605.a1c454b9a86c617a4878.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/64f69659.2d1e8aeec9ebbd06ab74.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/725.4459d6c763ec95ad3f64.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/768.3d02660c47549a11f620.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/786-37058dd926586d913c88.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/82c1d43a.1352fc07818d9dca555a.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/847.46f21225e46b3ab7eb74.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/94.181965f14387e8c72e57.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/945.34268175af12ab12ab0e.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/965.09800fefff778b3c7178.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/972.7256926e4db5ab5d72f2.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/d67bd397.8f5e28125cb09d806285.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/ee9ce975.2e294c1c80ef92e28aa6.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/fc6701f7.54c265f9c6b881b927dc.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/framework-3af989d3dbeb77832f99.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/main-93b62e6c718a32efe7c5.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/_app-726af1c9142c7a68d0b0.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/_error-70375524866f704e88d0.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/create-error-0fc318d4e458ba2f02e4.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/index-691b8b7a2fe3c0a99cb4.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/room-4d979d6daa22185c31b4.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/room/%5Bid%5D-3126f1afe2a4a09253c5.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/shhh-b6f697ec4bf2c54cbddb.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/signout-38e5f24214fad00e8919.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/pages/sponsorware-3086b1458999f5455ddc.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/polyfills-e7a279300235e161e32a.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/chunks/webpack-2d9326440aea00cf7720.js',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/_next/static/css/3ee26d14810bf4a3e99e.css',
          revision: 'SlB8WHIYQ6-iZY44JmlAT',
        },
        {
          url: '/android-chrome-192x192.png',
          revision: '57c9c4cd91d24d48b7ffdda0768fd225',
        },
        {
          url: '/android-chrome-512x512.png',
          revision: '8d2454e6cf551f8ca1e1d5670b13a8d1',
        },
        {
          url: '/android-chrome-maskable-192x192.png',
          revision: '71c93ce0b34d2fbb4c6654a9131a3d9d',
        },
        {
          url: '/android-chrome-maskable-512x512.png',
          revision: '4265b8c09997b16ac1493500b43f3755',
        },
        {
          url: '/android-chrome-maskable-beta-512x512.png',
          revision: '145800cf2381faf1c0f4a61c29a88448',
        },
        {
          url: '/apple-touch-icon.png',
          revision: '8081d08be3673ec33dbeecab06706b2b',
        },
        {
          url: '/favicon-16x16.png',
          revision: 'ac17d75b1ee007781212853a57b88285',
        },
        {
          url: '/favicon-32x32.png',
          revision: '360bc7cd4706c0657917f3b78fed6b71',
        },
        { url: '/favicon.ico', revision: 'b2bf6bb7b4d0234f3e6df44fd7d5707e' },
        { url: '/flat.png', revision: 'e0460141713b5c94104ce19b36c4b462' },
        {
          url: '/icons/grab.svg',
          revision: 'a1ca9e5c31d1edd2558ab075f72fde4e',
        },
        {
          url: '/icons/pointer.svg',
          revision: 'dff260f896fe23adb83341639fdf93be',
        },
        {
          url: '/icons/resize.svg',
          revision: '0a3cb701d15731e25919783801d18f95',
        },
        {
          url: '/images/hello.mp4',
          revision: 'b716f249cc6c781c91b0ac9dc23423b3',
        },
        { url: '/manifest.json', revision: '3e4cd02739cceee25488c97ca2ed59da' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: i,
              state: n,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 31536e3,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|mp4)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-media-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        const s = e.pathname
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        return !e.pathname.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    )
})
