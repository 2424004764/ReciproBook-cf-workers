import type { Context } from 'hono'
import type { AppEnv } from '../types'

export const ok = <T>(c: Context<AppEnv>, data: T, msg = 'ok') =>
  c.json({ code: 0, msg, data } as { code: number; msg: string; data: T })

export const fail = (c: Context<AppEnv>, msg: string, httpStatus: 400 | 401 | 403 | 404 | 422 | 500 = 400) =>
  c.json({ code: httpStatus, msg, data: null }, httpStatus)
