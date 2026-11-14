import express from 'express';
import { getStudentProfileById, deleteStudentSelections} from '../services/student-service.js';

const router = express.Router();

router.get('/:id', async (req,res,next) => {
    try{
        const {id} = req.params;
        const student = await getStudentProfileById(id);
        
        if(!student){
            return res.status(404).json({
                message: 'Your accout is not a student of the BSc.IT program.',
            })
        }
        return res.status(200).json(student);
    }catch(error){
        next(error);
    }
});

router.delete('/:id/selections', async (req,res,next) => {
    try{
        const {id} = req.params
        const result = await deleteStudentSelections(id)

        if(!result){
            return res.status(404).json({
                message: 'Your accout is not a student of the BSc.IT program.'
            });
        }
        return res.status(204).send();

    }catch(error){
        next(error);
    }
})

export default router;