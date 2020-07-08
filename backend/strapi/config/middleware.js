module.exports = {
  timeout: 100,
  load: {
    before: ["responseTime", "logger", "cors", "responses", "gzip"],
    order: [
      "Define the middlewares' load order by putting their name in this array is the right order",
    ],
    after: ["parser", "router"],
  },
  settings: {
    favicon: {
      path: "favicon.ico",
      maxAge: 86400000,
    },
    public: {
      path: "./public",
      maxAge: 60000,
    },
    language: {
      enabled: true,
      defaultLocale: "en-us",
      modes: ["query", "subdomain", "cookie", "header", "url", "tld"],
      cookieName: "locale",
    },
    request: {
      session: {
        enabled: true,
        client: "cookie",
        key: "strapi.sid",
        prefix: "strapi:sess:",
        secretKeys: ["mySecretKey1", "mySecretKey2"],
        httpOnly: true,
        maxAge: 86400000,
        overwrite: true,
        signed: false,
        rolling: false,
      },
      logger: {
        level: "debug",
        exposeInContext: true,
        requests: true,
      },
      parser: {
        enabled: true,
        multipart: true,
        includeUnparsed: true,
      },
    },
    response: {
      gzip: {
        enabled: false,
      },
      responseTime: {
        enabled: false,
      },
      poweredBy: {
        enabled: true,
        value: "Strapi <strapi.io>",
      },
    },
    security: {
      csp: {
        enabled: true,
        policy: ["block-all-mixed-content"],
      },
      p3p: {
        enabled: false,
        value: "",
      },
      hsts: {
        enabled: true,
        maxAge: 31536000,
        includeSubDomains: true,
      },
      xframe: {
        enabled: true,
        value: "SAMEORIGIN",
      },
      xss: {
        enabled: true,
        mode: "block",
      },
      cors: {
        enabled: true,
        origin: ["http://localhost:3000", "http://localhost:1337"],
        expose: [
          "WWW-Authenticate",
          "Server-Authorization",
          "Access-Control-Expose-Headers",
        ],
        maxAge: 31536000,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        headers: [
          "Content-Type",
          "Authorization",
          "X-Frame-Options",
          "Origin",
          "Access-Control-Allow-Origin",
        ],
      },
      ip: {
        enabled: false,
        whiteList: [],
        blackList: [],
      },
    },
  },
};
