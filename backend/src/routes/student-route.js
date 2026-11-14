import express from 'express';
import { getStudentProfileById, getStudentSelections } from '../services/student-service.js';

const router = express.Router();

router.get('/:id/selections', async (req, res) => {
    const selections = await getStudentSelections(req.params.id);
    if (selections === null) {
        return res.status(404).json({
            message: 'Your account is not a student of the BSc.IT program.',
        });
    }
    return res.json(selections);
});

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

export default router;
