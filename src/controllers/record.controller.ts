import type { RouteHandler } from '@hono/zod-openapi'
import type { AppEnv } from '../types'
import { RecordService } from '../services/record.service'
import type {
  getSummaryRoute,
  listRecordsRoute,
  getContactListRoute,
  getByContactRoute,
  searchRecordsRoute,
  createRecordRoute,
  getRecordRoute,
  updateRecordRoute,
  deleteRecordRoute,
} from '../routes/record.route'

const getSummaryHandler: RouteHandler<typeof getSummaryRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const data = await RecordService.getSummary(userId, c.env)
  return c.json({ code: 0, msg: 'ok', data }, 200)
}

const listHandler: RouteHandler<typeof listRecordsRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const { page, direction, type } = c.req.valid('query')
  const result = await RecordService.getList(userId, { page, direction, type }, c.env)
  return c.json({
    code: 0,
    msg: 'ok',
    data: result.data,
    total: result.total,
    hasMore: result.hasMore,
  }, 200)
}

const getContactListHandler: RouteHandler<typeof getContactListRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const data = await RecordService.getContactList(userId, c.env)
  return c.json({ code: 0, msg: 'ok', data }, 200)
}

const getByContactHandler: RouteHandler<typeof getByContactRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const { contactName } = c.req.valid('param')
  const data = await RecordService.getByContact(userId, contactName, c.env)
  return c.json({ code: 0, msg: 'ok', data }, 200)
}

const searchHandler: RouteHandler<typeof searchRecordsRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const { keyword } = c.req.valid('query')
  if (!keyword?.trim()) return c.json({ code: 0, msg: 'ok', data: [] }, 200)
  const data = await RecordService.search(userId, keyword, c.env)
  return c.json({ code: 0, msg: 'ok', data }, 200)
}

const createHandler: RouteHandler<typeof createRecordRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  if (!body.contactName?.trim() || !body.amount) {
    return c.json({ code: 400, msg: '联系人和金额不能为空', data: null }, 400)
  }
  const record = await RecordService.add(userId, body, c.env)
  return c.json({ code: 0, msg: 'ok', data: record }, 201)
}

const getByIdHandler: RouteHandler<typeof getRecordRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.valid('param')
  const record = await RecordService.getById(userId, id, c.env)
  if (!record) return c.json({ code: 404, msg: '记录不存在', data: null }, 404)
  return c.json({ code: 0, msg: 'ok', data: record }, 200)
}

const updateHandler: RouteHandler<typeof updateRecordRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const result = await RecordService.update(userId, id, body, c.env)
  if (!result) return c.json({ code: 404, msg: '记录不存在', data: null }, 404)
  return c.json({ code: 0, msg: 'ok', data: null }, 200)
}

const removeHandler: RouteHandler<typeof deleteRecordRoute, AppEnv> = async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.valid('param')
  const result = await RecordService.remove(userId, id, c.env)
  if (!result) return c.json({ code: 404, msg: '记录不存在', data: null }, 404)
  return c.body(null, 204)
}

export const RecordController = {
  getSummary: getSummaryHandler,
  list: listHandler,
  getContactList: getContactListHandler,
  getByContact: getByContactHandler,
  search: searchHandler,
  create: createHandler,
  getById: getByIdHandler,
  update: updateHandler,
  remove: removeHandler,
}
