import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import type { AppEnv } from './types'
import router from './routes'

const app = new OpenAPIHono<AppEnv>()

app.use('*', cors())

app.get('/', (c) => c.json({ status: 'ok' }))

app.route('/api', router)

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: { title: 'ReciproBook API', version: '1.0.0' },
})

export default app
