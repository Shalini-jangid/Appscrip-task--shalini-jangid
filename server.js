import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = process.cwd()
const isProd = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()

  let vite
  if (!isProd) {
    vite = await (await import('vite')).createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    app.use((await import('compression')).default())
    app.use('/assets', (await import('sirv')).default(path.resolve(root, 'dist/client/assets'), {
      immutable: true,
      maxAge: 31536000
    }))
    app.use(express.static(path.resolve(root, 'dist/client')))
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        template = fs.readFileSync(path.resolve(root, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
      } else {
        template = fs.readFileSync(path.resolve(root, 'dist/client/index.html'), 'utf-8')
        // In some environments, the file extension might be .js after build
        const renderPath = path.resolve(root, 'dist/server/entry-server.js')
        render = (await import(renderPath)).render
      }

      const { appHtml, headTags, initialData } = await render(url)

      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace(`<!--head-outlet-->`, headTags + `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.error('SSR Error:', e.stack)
      res.status(500).end(isProd ? 'Internal Server Error' : e.stack)
    }
  })

  return { app }
}

const { app } = await createServer()

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
}

export default app
