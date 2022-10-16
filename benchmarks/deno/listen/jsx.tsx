import {listen, respondWith} from '@virtualstate/listen'

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
      <html>
          <head>
              <title>Website</title>
              <meta name="url" content={url} />
              <meta name="method" content={method} />
              {
                  id ? <meta name="id" content={id} /> : undefined
              }
              {
                  name ? <meta name="name" content={name} /> : undefined
              }
          </head>
          <body>
              <h1>Hello World</h1>
              <p>This is an example.</p>
              {
                  body ? (
                      <script type="application/json" id="request-body">
                          {JSON.stringify(body, undefined, "  ")}
                      </script>
                  ) : undefined
              }
          </body>
      </html>
  );
})