import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { UserController } from '../controllers/user.controller'
import { RecordController } from '../controllers/record.controller'
import {
  userLoginRoute,
} from './user.route'
import {
  getSummaryRoute,
  listRecordsRoute,
  getContactListRoute,
  getByContactRoute,
  searchRecordsRoute,
  createRecordRoute,
  getRecordRoute,
  updateRecordRoute,
  deleteRecordRoute,
} from './record.route'

const router = new OpenAPIHono<AppEnv>()

// Public routes
router.openapi(userLoginRoute, UserController.login)

// Protected routes - records
router.use('/records', authMiddleware)
router.use('/records/*', authMiddleware)
router.openapi(getSummaryRoute, RecordController.getSummary)
router.openapi(listRecordsRoute, RecordController.list)
router.openapi(getContactListRoute, RecordController.getContactList)
router.openapi(getByContactRoute, RecordController.getByContact)
router.openapi(searchRecordsRoute, RecordController.search)
router.openapi(createRecordRoute, RecordController.create)
router.openapi(getRecordRoute, RecordController.getById)
router.openapi(updateRecordRoute, RecordController.update)
router.openapi(deleteRecordRoute, RecordController.remove)

export default router
