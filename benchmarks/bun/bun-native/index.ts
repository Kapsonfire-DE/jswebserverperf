const type = new Headers()
type.append('content-type', 'application/json')
const jsonHeader = {
    headers: type
}


const emptySearchParams = new URLSearchParams('');
Bun.serve({
              port: 3000,
              fetch: async (request) => {
                  const { url, method } = request

                  let pathname = url.replace(/^.*\/\/[^\/]+/, '');

                  let index = pathname.lastIndexOf("?");
                  let searchParams = null;
                  if (index > -1) {
                      searchParams = new URLSearchParams(pathname.substring(index+1));
                      pathname = pathname.substring(0, index);
                  } else {
                      searchParams = emptySearchParams;
                  }







                  if (method === 'GET' && pathname === '/') return new Response('Hi')
                  if (method === 'POST' && pathname === '/json')
                      return new Response(
                          JSON.stringify(await request.json()),
                          jsonHeader
                      )

                  if (method === 'GET' && pathname.startsWith('/id/')) {
                      const [id, extraPath] = pathname.substring(4).split('/')
                      if (!extraPath) {
                          return new Response(`${id} ${searchParams.get('name')}`, {
                              headers: {
                                  'x-powered-by': 'benchmark'
                              }
                          })
                      }
                  }

                  return new Response('Not Found', {
                      status: 404
                  })
              }
          })