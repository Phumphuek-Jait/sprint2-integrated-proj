import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const dataFile = process.env.MOCK_DATA_FILE || fileURLToPath(new URL('./data.json', import.meta.url))
const prefix = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1'
const data = JSON.parse(await readFile(dataFile, 'utf8'))
const port = Number(process.env.PORT || 3000)

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' })
  res.end(body === undefined ? undefined : JSON.stringify(body))
}

async function bodyOf(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  try { return body ? JSON.parse(body) : {} } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }) }
}

const save = () => writeFile(dataFile, JSON.stringify(data, null, 2) + '\n')
function studentOf(id) {
  if (!/^\d{11}$/.test(id) || id.slice(2, 8) !== data.academicSettings.programCode) return undefined
  const entryYear = Number(id.slice(0, 2))
  const number = Number(id.slice(8))
  const range = data.studentGroupRanges.find((item) => item.entryYear === entryYear && item.fromNo <= number && number <= item.toNo)
  return range && { studentId: id, yearLevel: (data.academicSettings.currentAcademicYear % 100) - entryYear + 1, studentGroup: range.studentGroup }
}
const listFor = (student) => data['course-options'].filter((item) => item.course.yearLevel === student.yearLevel && (!item.fixed || item.studentGroup === student.studentGroup || item.studentGroup === null))
const publicSelection = ({ id, ...selection }) => selection

createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204)
    const url = new URL(req.url, 'http://localhost')
    if (!url.pathname.startsWith(prefix + '/')) return send(res, 404, { message: 'Not found' })
    const path = url.pathname.slice(prefix.length).replace(/\/$/, '')
    const method = req.method
    if (path === '/health' && method === 'GET') return send(res, 200, data.health)

    const yearMatch = path.match(/^\/year-levels\/(\d+)\/schedules$/)
    if (yearMatch && method === 'GET') {
      const year = Number(yearMatch[1]); const group = url.searchParams.get('studentGroup')
      const items = data['course-options'].filter((s) => s.course.yearLevel === year && (!group || !s.fixed || s.studentGroup === group || s.studentGroup === null))
      return send(res, 200, items)
    }
    if (path === '/year-levels' && method === 'GET') {
      const year = url.searchParams.get('yearLevel')
      return send(res, 200, year === null ? data.schedules : data.schedules.filter((s) => s.course.yearLevel === Number(year)))
    }

    const studentMatch = path.match(/^\/students\/([^/]+)(?:\/selections(?:\/([^/]+))?)?$/)
    if (studentMatch) {
      const studentId = decodeURIComponent(studentMatch[1]); const student = studentOf(studentId)
      if (!student) return send(res, 404, { message: 'Student not found.' })
      if (!path.includes('/selections')) return method === 'GET' ? send(res, 200, { studentId, yearLevel: student.yearLevel, studentGroup: student.studentGroup }) : send(res, 405, { message: 'Method not allowed' })
      const courseId = studentMatch[2] === undefined ? null : Number(studentMatch[2])
      const index = data.selections.findIndex((s) => s.studentId === studentId && s.courseId === courseId)
      if (method === 'GET' && courseId === null) return send(res, 200, data.selections.filter((s) => s.studentId === studentId).sort((a, b) => a.courseId - b.courseId).map(publicSelection))
      if (method === 'DELETE' && courseId === null) { data.selections = data.selections.filter((s) => s.studentId !== studentId); await save(); return send(res, 204) }
      if (method === 'DELETE' && courseId !== null) { if (index < 0) return send(res, 404, { message: 'Selection not found.' }); data.selections.splice(index, 1); await save(); return send(res, 204) }
      if ((method === 'POST' && courseId === null) || (method === 'PUT' && courseId !== null)) {
        const body = await bodyOf(req); const selectedCourse = method === 'POST' ? body.courseId : courseId; const section = body.section
        if (!Number.isInteger(selectedCourse) || selectedCourse <= 0 || !Number.isInteger(section) || section < 1 || section > 99) return send(res, 400, { message: 'Invalid courseId or section.' })
        const existing = data.selections.find((s) => s.studentId === studentId && s.courseId === selectedCourse)
        if (method === 'POST' && existing) return send(res, 409, { message: 'This course is already in your schedule.' })
        if (method === 'PUT' && !existing) return send(res, 404, { message: 'Selection not found.' })
        if (!listFor(student).some((s) => s.course.id === selectedCourse && s.section === section && !s.fixed)) return send(res, 404, { message: 'Section not found.' })
        const now = new Date().toISOString()
        if (method === 'POST') {
          const selection = { id: `${studentId}-${selectedCourse}`, studentId, courseId: selectedCourse, section, createdAt: now, updatedAt: now }
          data.selections.push(selection); await save(); return send(res, 201, publicSelection(selection))
        }
        if (existing.section !== section) { existing.section = section; existing.updatedAt = now; await save() }
        return send(res, 200, publicSelection(existing))
      }
      return send(res, 405, { message: 'Method not allowed' })
    }

    const scheduleMatch = path.match(/^\/schedules(?:\/(\d+))?$/)
    if (scheduleMatch) {
      const id = scheduleMatch[1] === undefined ? null : Number(scheduleMatch[1])
      const index = data.schedules.findIndex((s) => s.id === id)
      if (method === 'GET' && id === null) { const year = url.searchParams.get('yearLevel'); return send(res, 200, year === null ? data.schedules : data.schedules.filter((s) => s.course.yearLevel === Number(year))) }
      if (method === 'GET') return index < 0 ? send(res, 404, { message: 'Schedule not found.' }) : send(res, 200, data.schedules[index])
      if (method === 'POST' && id === null) { const body = await bodyOf(req); const next = { ...body, id: Math.max(0, ...data.schedules.map((s) => s.id)) + 1 }; data.schedules.push(next); await save(); return send(res, 201, next) }
      if (method === 'PUT' && index >= 0) { const body = await bodyOf(req); data.schedules[index] = { ...data.schedules[index], ...body, id }; await save(); return send(res, 200, data.schedules[index]) }
      if (method === 'DELETE' && index >= 0) { data.schedules.splice(index, 1); await save(); return send(res, 204) }
      return send(res, index < 0 && id !== null ? 404 : 405, { message: 'Schedule not found or method not allowed.' })
    }
    return send(res, 404, { message: 'Not found' })
  } catch (error) { console.error(error); return send(res, error.status || 500, { message: error.message }) }
}).listen(port, '127.0.0.1', () => console.log(`Mock API: http://localhost:${port}${prefix}`))
