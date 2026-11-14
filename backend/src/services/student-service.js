import {prisma} from '../configs/prisma-client.js'

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