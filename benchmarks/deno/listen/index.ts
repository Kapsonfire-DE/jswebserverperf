import { listen, route } from '@virtualstate/listen/routes'

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

void listen();