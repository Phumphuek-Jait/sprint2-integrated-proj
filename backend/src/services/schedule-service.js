import { prisma } from '../configs/prisma-client.js'
import ScheduleMapper from '../mappers/schedule-mapper.js'

export async function getAllObjects() {
  const schedules = await prisma.courseSchedule.findMany({
    include: { course: true },
    orderBy: [
      { course: { yearLevel: 'asc' } },
      { courseId: 'asc' },
      { section: 'asc' },
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  })

  return ScheduleMapper.maps(schedules)
}

export async function getSchedulesByYearLevel(yearLevel) {
  const schedules = await prisma.courseSchedule.findMany({
    where: {
      course: {
        yearLevel: yearLevel
      }
    },
    include: {
      course: true
    },
    orderBy: [
      { course: { yearLevel: 'asc' } },
      { courseId: 'asc' },
      { section: 'asc' },
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  })

  return ScheduleMapper.maps(schedules)
}

export async function getObject(id) {
  return await prisma.courseSchedule.findUnique({ where: { id: id } })
}

export async function updateObject(id, brand) {
  return await prisma.courseSchedule.update({
    where: { id: id },
    data: brand
  })
}

export async function removeObject(id) {
  return await prisma.courseSchedule.delete({ where: { id: id } })
}

export async function createObject(data) {
  return await prisma.courseSchedule.create({ data: data })
}
