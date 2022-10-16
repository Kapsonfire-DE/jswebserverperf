import { listen, route } from '@virtualstate/listen/routes';
import { respondWith } from '@virtualstate/listen';
import { enableURLPatternCache } from '@virtualstate/navigation/routes';
import {h} from "@virtualstate/focus";

enableURLPatternCache()

const type = new Headers()
type.append('content-type', 'application/json')
const jsonHeader = {
    headers: type
}

route('/', () => {
    return new Response('Hi')
})

route('/json', async ({ request }) => {
    const { method } = request;
    if (method !== 'POST') return new Response('', { status: 500 });
    const body = await request.json();
    return new Response(
        JSON.stringify(body),
        jsonHeader
    )
});

route('/id/:id', ({ request }, { pathname: { groups: { id }} }) => {
    const { searchParams } = new URL(request.url);
    return new Response(`${id} ${searchParams.get('name')}`, {
        headers: {
            'x-powered-by': 'benchmark'
        }
    })
})

route('/jsx', event => {
    respondWith(
        event,
        h("html", {},
            h("body", {},
                h("h1", {}, "Hello World"),
                h("p", {}, "This is an example.")
            )
        )
    )
})

void listen();