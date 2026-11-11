import express from 'express'
import { apiResponse } from '../mappers/api-response.js'
import * as service from '../services/schedule-service.js'
import httpStatus from 'http-status'

const router = express.Router()

// router.get('/', async (req, res) => {
//   const schedules = await service.getAllObjects()
//   return res.json(schedules)
// })

router.get('/', async (req, res) => {
  const { yearLevel } = req.query

  // ถ้าไม่ได้เลือกชั้นปี ให้แสดงทุกตาราง
  if (yearLevel === undefined) {
    const schedules = await service.getAllObjects()
    return res.json(schedules)
  }

  const level = Number(yearLevel)

  // ตรวจสอบค่าชั้นปี
  if (!Number.isInteger(level) || level < 1 || level > 4) {
    return res.status(400).json({
      message: 'Invalid yearLevel. Please provide a value between 1 and 4.'
    })
  }

  const schedules = await service.getSchedulesByYearLevel(level)
  return res.json(schedules)
})

router.get('/:yearLevel/schedules', async (req, res) => {
  const yearLevel = Number(req.params.yearLevel)
  const {studentGroup} = req.query
  const object = await service.getSchedulesByYearLevel(yearLevel, studentGroup)
  return res.json(object)
})

// router.post('/', async (req, res) => {
//   const object = req.body
//   const result = await service.createObject(object)
//   apiRespone(res, result, httpStatus.CREATED)
// })
// router.put('/:id', async (req, res) => {
//   const id = req.params.id
//   const object = await service.updateObject(id, req.body)
//   res.json(object)
// })
// router.delete('/:id', async (req, res) => {
//   const id = req.params.id
//   await service.removeObject(id)
//   res.status(204).end()
// })
export default router
