import { createServer } from 'node:http';

const xPoweredBy = 'benchmark';

const app = createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url, 'http://example.com')
    const { method } = req;
    if (method === 'GET') {
        if (pathname === "/") {
            res.writeHead(200);
            res.write('hi');
            return res.end();
        } else if (pathname.startsWith('/id/')) {
            const [id, extraPath] = pathname.substring(4).split('/')
            res.setHeader('x-powered-by', xPoweredBy);
            res.writeHead(200);
            res.write(`${id} ${searchParams.get('name')}`);
            return res.end();
        }
    }

    if (method === 'POST') {
      if (pathname === '/json') {
          const parts = [];
          req.on('data', chunk => parts.push(chunk.toString('utf-8')));
          req.on('end', () => {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200);
              res.write(JSON.stringify(
                  parts.join('')
              ))
              res.end();
          });
          return;
      }
    }

    res.writeHead(404);
    return res.end();

});

app.listen(3000)