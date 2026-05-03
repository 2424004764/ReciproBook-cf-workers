import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'
import { fail } from '../utils/response'
import { verifyToken } from '../utils/jwt'

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(c, 'Unauthorized', 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    c.set('userId', payload.id as number)
    await next()
  } catch {
    return fail(c, 'Unauthorized', 401)
  }
}
