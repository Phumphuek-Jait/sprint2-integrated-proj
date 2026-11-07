export default class ScheduleMapper {
    static toSummaryDTO(schedule) {
        return {
            code: schedule.course.code,
            title: schedule.course.title,
            type: schedule.course.type,
            section: schedule.section,
            group: schedule.studentGroup,
            day: schedule.dayOfWeek,
            time: `${formatTime(schedule.startTime)}-${formatTime(schedule.endTime)}`,
            weeks: `${schedule.startWeek}-${schedule.endWeek}`,
        }
    }

    static toDetailDTO(schedule) {
        const { ...data } = schedule
        return data
    }

    static map(schedule, viewType) {
        if (viewType === 'summary') {
            return this.toSummaryDTO(schedule)
        }
        return this.toDetailDTO(schedule)
    }

    static maps(schedules, viewType) {
        if (viewType === 'full') {
            return schedules.map((schedule) => this.toDetailDTO(schedule))
        }
        return schedules.map((schedule) => this.toSummaryDTO(schedule))
    }
}

function formatTime(time) {
    return time.toISOString().slice(11, 16)
}
