import express from 'express'
import { apiResponse } from '../mappers/api-response.js'
import * as service from '../services/schedule-service.js'
import httpStatus from "http-status";


const router = express.Router()

router.get('/', async (req, res) => {
    const schedules = await service.getAllObjects()
    return apiResponse(res, schedules)
})
router.get("/:id", async (req, res) => {
    const id = req.params.id
    const object = await service.getObject(id)
    res.json(object)
})

router.post("/", async (req, res) => {
    const object = req.body
    const result = await service.createObject(object)
    apiRespone(res, result, httpStatus.CREATED)
})
router.put("/:id", async (req, res) => {
    const id = req.params.id
    const object = await service.updateObject(id, req.body)
    res.json(object)
})
router.delete("/:id", async (req, res) => {
    const id = req.params.id
    await service.removeObject(id)
    res.status(204).end()
})
export default router
