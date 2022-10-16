import { listen, respondWith } from '@virtualstate/listen'
import { h } from '@virtualstate/focus';

const type = new Headers()
type.append('content-type', 'application/json')
const jsonHeader = {
    headers: type
}

void listen(async (event) => {
    const { request } = event;
    const { url, method } = request
    const { pathname, searchParams } = new URL(url)

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

    if (method === 'GET' && pathname === '/jsx') {
        return respondWith(
            event,
            h("html", {},
                h("body", {},
                    h("h1", {}, "Hello World"),
                    h("p", {}, "This is an example.")
                )
            )
        );
    }

    return new Response('Not Found', {
        status: 404
    })
})