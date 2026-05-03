import type { RqRecordRow, RecordItem, SummaryData, ContactSummary } from '../models/record.model'
import { toRecordItem } from '../models/record.model'

const PAGE_SIZE = 20

export const RecordService = {
  async getSummary(userId: number, env: Env): Promise<SummaryData> {
    const [inRes, outRes, countRes] = await Promise.all([
      env.DB.prepare(
        'SELECT COALESCE(SUM(amount), 0) as total FROM rq_records WHERE user_id = ? AND direction = ?'
      ).bind(userId, 'in').first<{ total: number }>(),
      env.DB.prepare(
        'SELECT COALESCE(SUM(amount), 0) as total FROM rq_records WHERE user_id = ? AND direction = ?'
      ).bind(userId, 'out').first<{ total: number }>(),
      env.DB.prepare(
        'SELECT COUNT(*) as count FROM rq_records WHERE user_id = ?'
      ).bind(userId).first<{ count: number }>(),
    ])
    const totalIn = inRes?.total ?? 0
    const totalOut = outRes?.total ?? 0
    return { totalIn, totalOut, balance: totalIn - totalOut, count: countRes?.count ?? 0 }
  },

  async getList(
    userId: number,
    params: { page?: number; direction?: string; type?: string },
    env: Env,
  ): Promise<{ data: RecordItem[]; total: number; hasMore: boolean }> {
    const page = params.page ?? 0
    const conditions: string[] = ['user_id = ?']
    const bindings: unknown[] = [userId]

    if (params.direction && params.direction !== 'all') {
      conditions.push('direction = ?')
      bindings.push(params.direction)
    }
    if (params.type && params.type !== 'all') {
      conditions.push('type = ?')
      bindings.push(params.type)
    }

    const where = conditions.join(' AND ')
    const offset = page * PAGE_SIZE

    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM rq_records WHERE ${where}`
    ).bind(...bindings).first<{ total: number }>()

    const total = countResult?.total ?? 0

    const rows = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE ${where} ORDER BY event_time DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, PAGE_SIZE, offset).all<RqRecordRow>()

    return {
      data: rows.results.map(toRecordItem),
      total,
      hasMore: rows.results.length === PAGE_SIZE,
    }
  },

  async getContactList(userId: number, env: Env): Promise<ContactSummary[]> {
    const rows = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE user_id = ? ORDER BY event_time DESC`
    ).bind(userId).all<RqRecordRow>()

    const map = new Map<string, ContactSummary>()
    for (const r of rows.results) {
      const name = r.contact_name
      const existing = map.get(name)
      if (existing) {
        if (r.direction === 'in') existing.totalIn += r.amount
        else existing.totalOut += r.amount
        if (r.event_time > existing.lastTime) existing.lastTime = r.event_time
      } else {
        map.set(name, {
          contactName: name,
          totalIn: r.direction === 'in' ? r.amount : 0,
          totalOut: r.direction === 'out' ? r.amount : 0,
          lastTime: r.event_time,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastTime - a.lastTime)
  },

  async getByContact(userId: number, contactName: string, env: Env): Promise<RecordItem[]> {
    const rows = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE user_id = ? AND contact_name = ? ORDER BY event_time DESC`
    ).bind(userId, contactName).all<RqRecordRow>()
    return rows.results.map(toRecordItem)
  },

  async search(userId: number, keyword: string, env: Env): Promise<RecordItem[]> {
    const kw = `%${keyword.trim()}%`
    const rows = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE user_id = ? AND (contact_name LIKE ? OR remark LIKE ? OR type LIKE ?) ORDER BY event_time DESC LIMIT 50`
    ).bind(userId, kw, kw, kw).all<RqRecordRow>()
    return rows.results.map(toRecordItem)
  },

  async add(
    userId: number,
    data: {
      contactName: string
      amount: number
      direction: 'in' | 'out'
      type?: string
      eventTime?: number
      occasion?: string
      remark?: string
    },
    env: Env,
  ): Promise<{ _id: number }> {
    const now = Date.now()
    const result = await env.DB.prepare(
      `INSERT INTO rq_records (user_id, contact_name, amount, direction, type, event_time, occasion, remark, create_time, update_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      data.contactName.trim(),
      data.amount,
      data.direction || 'out',
      data.type || '红包',
      data.eventTime || now,
      data.occasion?.trim() || '',
      data.remark?.trim() || '',
      now,
      now,
    ).run()
    return { _id: result.meta.last_row_id as number }
  },

  async getById(userId: number, id: number, env: Env): Promise<RecordItem | null> {
    const record = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE id = ? AND user_id = ?`
    ).bind(id, userId).first<RqRecordRow>()
    return record ? toRecordItem(record) : null
  },

  async update(
    userId: number,
    id: number,
    data: {
      contactName?: string
      amount?: number
      direction?: 'in' | 'out'
      type?: string
      eventTime?: number
      occasion?: string
      remark?: string
    },
    env: Env,
  ): Promise<boolean> {
    const existing = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE id = ? AND user_id = ?`
    ).bind(id, userId).first<RqRecordRow>()
    if (!existing) return false

    const now = Date.now()
    await env.DB.prepare(
      `UPDATE rq_records SET contact_name = ?, amount = ?, direction = ?, type = ?, event_time = ?, occasion = ?, remark = ?, update_time = ? WHERE id = ? AND user_id = ?`
    ).bind(
      (data.contactName ?? existing.contact_name).trim(),
      data.amount ?? existing.amount,
      data.direction ?? existing.direction,
      data.type ?? existing.type,
      data.eventTime ?? existing.event_time,
      (data.occasion ?? existing.occasion).trim(),
      (data.remark ?? existing.remark).trim(),
      now,
      id,
      userId,
    ).run()
    return true
  },

  async remove(userId: number, id: number, env: Env): Promise<boolean> {
    const existing = await env.DB.prepare(
      `SELECT * FROM rq_records WHERE id = ? AND user_id = ?`
    ).bind(id, userId).first<RqRecordRow>()
    if (!existing) return false
    await env.DB.prepare(
      `DELETE FROM rq_records WHERE id = ? AND user_id = ?`
    ).bind(id, userId).run()
    return true
  },
}
