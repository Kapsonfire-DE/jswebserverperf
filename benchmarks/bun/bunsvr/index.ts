import { Router } from "@bunsvr/router";

const router = new Router();

router.static("GET", "/",
              () => new Response("hi")
);

router.static("POST", "/json",
              async req => Response.json(await req.json())
);

router.dynamic("GET", "/id/:id",
               async (req, server, params) => {
                   const name = req.url.slice(params[0].length + 6);

                   return new Response(`${params[1]} ${name}`, {
                       headers: { "x-powered-by": "benchmark" }
                   });
               }
);

router.serve();