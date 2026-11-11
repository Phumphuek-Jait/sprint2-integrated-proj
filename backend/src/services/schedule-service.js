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
      { startTime: 'asc' },
      { id: 'asc' }
    ]
  })

  return ScheduleMapper.maps(schedules)
}

export async function getSchedulesByYearLevel(yearLevel, studentGroup) {
  const schedules = await prisma.courseSchedule.findMany({
    where: {
      course: {
        yearLevel: yearLevel
      },
      ...(studentGroup && { studentGroup: studentGroup })
    },
    include: {
      course: true
    },
    orderBy: [
      { course: { yearLevel: 'asc' } },
      { courseId: 'asc' },
      { section: 'asc' },
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
      { id: 'asc' }
    ]
  })
  const counts = {}

  schedules.forEach((schedule) => {
    const key = `${schedule.section}:${schedule.studentGroup}`
    if (counts[key] === undefined) {
      counts[key] = 0
    }
    counts[key]++
  })

  return ScheduleMapper.maps(schedules, 'yearlevelWithg', counts)
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
