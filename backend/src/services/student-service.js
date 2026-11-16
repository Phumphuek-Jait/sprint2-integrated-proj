import {prisma} from '../configs/prisma-client.js'
import { getSchedulesByYearLevelAndGroup } from './schedule-service.js'
import { AppError } from '../middlewares/error-handler.js'

export const getStudentProfileById = async (id) => {
    if(!/^[0-9]{11}$/.test(id)) {
        return null
    }
    const EntryYear = parseInt(id.slice(0,2), 10);
    const ProgramCode = id.slice(2,8);
    const StudentNumber = parseInt(id.slice(8,11), 10);

    const setting = await prisma.academicSetting.findFirst();
    if(!setting || setting.programCode !== ProgramCode) {
        return null
    }

    const groupRange = await prisma.studentGroupRange.findFirst({
        where: {
            entryYear: EntryYear,
            fromNo: {lte: StudentNumber},
            toNo: {gte: StudentNumber},
        }
    });

    if(!groupRange){
        return null;
    }

    const yearLevel = (setting.currentAcademicYear % 100) - EntryYear + 1;

    return {
        studentId: id,
        yearLevel: yearLevel,
        studentGroup: groupRange.studentGroup
    };
}

export const deleteStudentSelections = async (id) => {
    const student = await getStudentProfileById(id)
    
    if(!student){
        return null;
    }

    await prisma.selection.deleteMany({ //ลบข้อมูลหลายรายการ
        where: {
            studentId: id
        }
    });
    return true;
}

export const getStudentSelections = async (id) => {
    const student = await getStudentProfileById(id);
    if (!student) {
        return null;
    }

    return prisma.selection.findMany({
        where: { studentId: id },
        orderBy: { courseId: 'asc' },
    });
};

export const createStudentSelection = async (id, courseId, section) => {
    const student = await getStudentProfileById(id);
    if (!student) throw new AppError('Student not found.', 404);

    if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(section) || section <= 0) {
        throw new AppError('courseId and section must be positive integers.', 400);
    }

    const existing = await prisma.selection.findUnique({
        where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (existing) throw new AppError('This course is already in your schedule.', 409);

    const schedules = await getSchedulesByYearLevelAndGroup(student.yearLevel, student.studentGroup);
    const available = schedules.some((schedule) =>
        schedule.course.id === courseId && schedule.section === section && !schedule.fixed
    );
    if (!available) throw new AppError('This section is not available.', 404);

    const now = new Date();
    return prisma.selection.create({
        data: { studentId: id, courseId, section, createdAt: now, updatedAt: now },
    });
};

export const deleteStudentSelectionsByCourse = async (studentId, courseId) => {
    const student = await getStudentProfileById(studentId)
    if(!student){
        throw new AppError(`Student ${studentId} not found.`, 404);
    }

    const parsedCourseId = Number(courseId)
    if(!Number.isInteger(parsedCourseId) || parsedCourseId <= 0){
        throw new AppError(`Selection for course ${courseId} not found`, 404);
    }

    const existingSelection = await prisma.selection.findUnique({
        where: {
            studentId_courseId : {
                studentId: String(studentId),
                courseId: parsedCourseId
            }
        }
    });

    if(!existingSelection){
        throw new AppError(`Selection for course ${courseId} not found.`, 404)
    }

    await prisma.selection.delete({
        where: {
            studentId_courseId: {
                studentId: String(studentId),
                courseId: parsedCourseId
            }
        }
    });
}
