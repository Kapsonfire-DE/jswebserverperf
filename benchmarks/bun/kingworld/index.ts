import KingWorld from 'kingworld'

const app = new KingWorld()

app.get('/', () => 'Hi')
    .post('/json', (ctx) => ctx.body)
    .get('/id/:id', (ctx) => {
        ctx.set.headers['x-powered-by'] = 'benchmark'

        return `${ctx.params.id} ${ctx.query.name}`
    })
    .listen(3000)

export default app
