import { createCell, toCapitalize } from './utils/tableUtils.js'

export function showCourseOptions(schedules, selections, onSelect) {
  const section = document.getElementById('course-options-section')
  const body = document.getElementById('course-options-body')

  const selectedCourseIds = new Set(
    selections.map((selection) => Number(selection.courseId))
  )

  // Only show option courses that have not been selected
  const options = schedules.filter(
    (schedule) =>
      schedule.fixed === false &&
      !selectedCourseIds.has(Number(schedule.course.id))
  )

  const rows = document.createDocumentFragment()

  for (const schedule of options) {
    const row = document.createElement('tr')
    row.dataset.testid = 'schedule-row'

    row.append(
      createCell('code', schedule.course.code),
      createCell('title', schedule.course.title),
      createCell('type', schedule.course.type),
      createCell('section', schedule.section),
      createCell('group', schedule.studentGroup),
      createCell('day', toCapitalize(schedule.dayOfWeek)),
      createCell(
        'time',
        `${schedule.startTime ?? ''}-${schedule.endTime ?? ''}`
      ),
      createCell(
        'weeks',
        `${schedule.startWeek ?? ''}-${schedule.endWeek ?? ''}`
      ),
      createCell('room', schedule.room),
      createCell('remarks', schedule.remarks)
    )

    // Select Button
    const actionCell = document.createElement('td')

    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Select'
    button.dataset.testid = 'select-button'

    button.addEventListener('click', () => {
      onSelect(schedule, button)
    })

    actionCell.append(button)
    row.append(actionCell)

    rows.append(row)
  }

  body.replaceChildren(rows)

  // Hide heading and table if there are no available courses
  section.hidden = options.length === 0
}
