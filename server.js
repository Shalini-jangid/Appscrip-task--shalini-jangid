import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()

  // Create Vite server in development mode
  let vite
  if (!isProd) {
    vite = await (await import('vite')).createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    app.use((await import('compression')).default())
    app.use('/assets', (await import('sirv')).default(path.resolve(__dirname, 'dist/client/assets'), {
      immutable: true,
      maxAge: 31536000
    }))
    app.use(express.static(path.resolve(__dirname, 'dist/client')))
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        // Read index.html
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        // Transform index.html (e.g. inject Vite client)
        template = await vite.transformIndexHtml(url, template)
        // Load entry-server.jsx
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
        render = (await import('./dist/server/entry-server.js')).render
      }

      const { appHtml, headTags, initialData } = await render(url)

      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace(`<!--head-outlet-->`, headTags + `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app }
}

const port = process.env.PORT || 3000
createServer().then(({ app }) =>
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
)
