import type { User } from '../models/user.model'

export const UserService = {
  async loginByCode(code: string, source: string, env: Env): Promise<User> {
    const url =
      `https://api.weixin.qq.com/sns/jscode2session` +
      `?appid=${env.WX_APPID}&secret=${env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`

    const res = await fetch(url)
    const wx = await res.json<{ openid?: string; errcode?: number; errmsg?: string }>()

    if (!wx.openid) {
      throw new Error(wx.errmsg ?? '微信登录失败')
    }

    const now = new Date().toISOString()
    const { openid } = wx

    const existing = await env.DB.prepare(
      'SELECT * FROM users WHERE openid = ?'
    ).bind(openid).first<User>()

    if (existing) {
      await env.DB.prepare(
        'UPDATE users SET last_login_at = ? WHERE openid = ?'
      ).bind(now, openid).run()
      return { ...existing, last_login_at: now }
    }

    const result = await env.DB.prepare(
      'INSERT INTO users (openid, source, last_login_at, created_at) VALUES (?, ?, ?, ?)'
    ).bind(openid, source, now, now).run()

    return {
      id: result.meta.last_row_id as number,
      openid,
      source,
      last_login_at: now,
      created_at: now,
    }
  },
}
