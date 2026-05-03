// 数据库中的记录（snake_case 列名）
export interface RqRecordRow {
  id: number
  user_id: number
  contact_name: string
  amount: number
  direction: 'in' | 'out'
  type: string
  event_time: number
  occasion: string
  remark: string
  create_time: number
  update_time: number
}

// 响应给前端的记录（camelCase）
export interface RecordItem {
  _id: number
  contactName: string
  amount: number
  direction: 'in' | 'out'
  type: string
  eventTime: number
  occasion: string
  remark: string
  createTime: number
  updateTime: number
}

export interface SummaryData {
  totalIn: number
  totalOut: number
  balance: number
  count: number
}

export interface ContactSummary {
  contactName: string
  totalIn: number
  totalOut: number
  lastTime: number
}

// 将 DB 行转为前端格式
export function toRecordItem(r: RqRecordRow): RecordItem {
  return {
    _id: r.id,
    contactName: r.contact_name,
    amount: r.amount,
    direction: r.direction,
    type: r.type,
    eventTime: r.event_time,
    occasion: r.occasion,
    remark: r.remark,
    createTime: r.create_time,
    updateTime: r.update_time,
  }
}
