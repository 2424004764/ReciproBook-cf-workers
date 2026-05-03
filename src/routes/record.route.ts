import { createRoute, z } from '@hono/zod-openapi'

const RecordItem = z.object({
  _id: z.number(),
  contactName: z.string(),
  amount: z.number(),
  direction: z.enum(['in', 'out']),
  type: z.string(),
  eventTime: z.number(),
  occasion: z.string(),
  remark: z.string(),
  createTime: z.number(),
  updateTime: z.number(),
})

export const getSummaryRoute = createRoute({
  method: 'get',
  path: '/records/summary',
  tags: ['Records'],
  summary: '获取统计数据',
  responses: {
    200: {
      description: '统计结果',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.object({
              totalIn: z.number(),
              totalOut: z.number(),
              balance: z.number(),
              count: z.number(),
            }),
          }),
        },
      },
    },
  },
})

export const listRecordsRoute = createRoute({
  method: 'get',
  path: '/records',
  tags: ['Records'],
  summary: '分页获取记录列表',
  request: {
    query: z.object({
      page: z.coerce.number().optional().default(0),
      direction: z.enum(['in', 'out', 'all']).optional(),
      type: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: '记录列表',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: RecordItem.array(),
            total: z.number(),
            hasMore: z.boolean(),
          }),
        },
      },
    },
  },
})

export const getContactListRoute = createRoute({
  method: 'get',
  path: '/records/contacts',
  tags: ['Records'],
  summary: '获取联系人聚合列表',
  responses: {
    200: {
      description: '联系人列表',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.array(z.object({
              contactName: z.string(),
              totalIn: z.number(),
              totalOut: z.number(),
              lastTime: z.number(),
            })),
          }),
        },
      },
    },
  },
})

export const getByContactRoute = createRoute({
  method: 'get',
  path: '/records/contact/{contactName}',
  tags: ['Records'],
  summary: '获取某联系人的所有记录',
  request: {
    params: z.object({
      contactName: z.string(),
    }),
  },
  responses: {
    200: {
      description: '联系人记录',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: RecordItem.array(),
          }),
        },
      },
    },
  },
})

export const searchRecordsRoute = createRoute({
  method: 'get',
  path: '/records/search',
  tags: ['Records'],
  summary: '关键词搜索记录',
  request: {
    query: z.object({
      keyword: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: '搜索结果',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: RecordItem.array(),
          }),
        },
      },
    },
  },
})

export const createRecordRoute = createRoute({
  method: 'post',
  path: '/records',
  tags: ['Records'],
  summary: '添加记录',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            contactName: z.string().min(1),
            amount: z.number().positive(),
            direction: z.enum(['in', 'out']).optional().default('out'),
            type: z.string().optional().default('红包'),
            eventTime: z.number().optional(),
            occasion: z.string().optional(),
            remark: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: '创建成功',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.object({
              _id: z.number(),
            }),
          }),
        },
      },
    },
    400: {
      description: '参数错误',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.null(),
          }),
        },
      },
    },
  },
})

export const getRecordRoute = createRoute({
  method: 'get',
  path: '/records/{id}',
  tags: ['Records'],
  summary: '获取单条记录',
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: '记录详情',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: RecordItem,
          }),
        },
      },
    },
    404: {
      description: '记录不存在',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.null(),
          }),
        },
      },
    },
  },
})

export const updateRecordRoute = createRoute({
  method: 'put',
  path: '/records/{id}',
  tags: ['Records'],
  summary: '更新记录',
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            contactName: z.string().optional(),
            amount: z.number().optional(),
            direction: z.enum(['in', 'out']).optional(),
            type: z.string().optional(),
            eventTime: z.number().optional(),
            occasion: z.string().optional(),
            remark: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: '更新成功',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.null(),
          }),
        },
      },
    },
    404: {
      description: '记录不存在',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.null(),
          }),
        },
      },
    },
  },
})

export const deleteRecordRoute = createRoute({
  method: 'delete',
  path: '/records/{id}',
  tags: ['Records'],
  summary: '删除记录',
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    204: {
      description: '删除成功',
    },
    404: {
      description: '记录不存在',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.null(),
          }),
        },
      },
    },
  },
})
