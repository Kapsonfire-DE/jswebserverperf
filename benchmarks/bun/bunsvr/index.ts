import { Router } from "@bunsvr/router";

const router = new Router();

router.static("GET", "/",
              () => new Response("hi")
);

router.static("POST", "/json",
              async req => new Response(JSON.stringify(await req.json()))
);

router.dynamic("GET", "/id/:id",
               async (req, server, params) => {
                   const name = new URL(req.url).searchParams.get("name");

                   return new Response(`${params[1]} ${name}`, {
                       headers: { "x-powered-by": "benchmark" }
                   });
               }
);

router.serve();