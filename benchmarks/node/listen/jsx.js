import {listen, respondWith} from '@virtualstate/listen'
import {h} from '@virtualstate/focus';

void listen(async (event) => {
  const { request } = event;
  const { url, method } = request
  const { pathname, searchParams } = new URL(url)

  let id,
      name;
  if (pathname.startsWith("/id/")) {
      const [firstPart, extraPath] = pathname.substring(4).split('/')
      if (!extraPath) {
          id = firstPart;
          name = searchParams.get('name');
      }
  }


  let body;
  if (method === 'POST') {
      body = await request.json();
  }

  respondWith(
      event,
      h("html", {},
          h("head", {},
              h("title", {}, "Website"),
              h("meta", { name: "url", content: url }),
              h("meta", { name: "method", content: method }),
              id ? h("meta", { name: "id", content: id }) : undefined,
              id ? h("meta", { name: "name", content: name }) : undefined,
          ),
          h("body", {},
              h("h1", {}, "Hello world"),
              h("p", {}, "This is an example."),
              body ? h(
                  "script",
                      {
                          type: "application/json",
                          id: "request-body"
                      },
                      JSON.stringify(body)
              ) : undefined
        )
    )
  );
})