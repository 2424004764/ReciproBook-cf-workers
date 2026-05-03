import { createRoute, z } from '@hono/zod-openapi'

export const userLoginRoute = createRoute({
  method: 'post',
  path: '/user/login',
  tags: ['User'],
  summary: '微信小程序登录',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            code: z.string().min(1),
            source: z.string().optional().default(''),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: '登录成功',
      content: {
        'application/json': {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
            data: z.object({
              token: z.string(),
              exp: z.number(),
            }),
          }),
        },
      },
    },
    400: {
      description: '登录失败',
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
