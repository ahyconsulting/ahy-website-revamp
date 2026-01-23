export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    const isPreprod = url.hostname === "preprod.ahyconsulting.com";

    // -----------------------------
    // HTTP BASIC AUTH FOR PREPROD
    // -----------------------------
    /* if (isPreprod) {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return new Response("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Preprod AHY Consulting"',
          },
        });
      }

      const base64Credentials = authHeader.replace("Basic ", "");
      const decoded = atob(base64Credentials);
      const [user, pass] = decoded.split(":");

      if (
        user !== env.PREPROD_AUTH_USER ||
        pass !== env.PREPROD_AUTH_PASS
      ) {
        return new Response("Invalid credentials", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Preprod AHY Consulting"',
          },
        });
      }
    } */

    // -----------------------------
    // STATIC ASSET HANDLING
    // -----------------------------

    // 1) Try exact match first
    let res = await env.ASSETS.fetch(request);
    if (res.status !== 404) {
      // Force browser caching for videos
      if (url.pathname.endsWith(".mp4")) {
        res = new Response(res.body, res);
        res.headers.set(
          "Cache-Control",
          "public, max-age=31536000, immutable"
        );
      }
      return res;
    }

    // 2) Try ".html" fallback
    const looksLikeFile = url.pathname.includes(".");
    if (!looksLikeFile) {
      const htmlReq = new Request(
        new URL(url.pathname + ".html", url.origin),
        request
      );
      res = await env.ASSETS.fetch(htmlReq);
      if (res.status !== 404) return res;
    }

    // 3) Serve custom 404.html
    const notFoundReq = new Request(new URL("/404.html", url.origin), request);
    const notFound = await env.ASSETS.fetch(notFoundReq);

    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};