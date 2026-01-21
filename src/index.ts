export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // 1) Try exact match first (/css/app.css, /about.html, /images/x.png)
    let res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // 2) If URL has no extension, try ".html" (so /about -> /about.html)
    const looksLikeFile = url.pathname.includes(".");
    if (!looksLikeFile) {
      const htmlReq = new Request(new URL(url.pathname + ".html", url.origin), request);
      res = await env.ASSETS.fetch(htmlReq);
      if (res.status !== 404) return res;
    }

    // 3) Serve your custom 404.html (keep status 404)
    const notFoundReq = new Request(new URL("/404.html", url.origin), request);
    const notFound = await env.ASSETS.fetch(notFoundReq);
    return new Response(notFound.body, { status: 404, headers: notFound.headers });
  },
};