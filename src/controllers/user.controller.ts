import { UserService } from '../services/user.service'
import type { AppEnv } from '../types'
import { signToken } from '../utils/jwt'
import type { RouteHandler } from '@hono/zod-openapi'
import type { userLoginRoute } from '../routes/user.route'

const loginHandler: RouteHandler<typeof userLoginRoute, AppEnv> = async (c) => {
  const { code, source } = c.req.valid('json')
  try {
    const user = await UserService.loginByCode(code, source ?? '', c.env)
    const { token, exp } = await signToken({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ code: 0, msg: 'ok', data: { token, exp } }, 200)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'login failed'
    return c.json({ code: 400, msg, data: null }, 400)
  }
}

export const UserController = {
  login: loginHandler,
}
