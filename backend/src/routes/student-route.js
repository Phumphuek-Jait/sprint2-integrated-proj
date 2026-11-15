import express from 'express';
import { getStudentProfileById, getStudentSelections, createStudentSelection } from '../services/student-service.js';
import { AppError } from '../middlewares/error-handler.js';

const router = express.Router();

router.post('/:id/selections', async (req, res) => {
    const { courseId, section } = req.body ?? {};
    const selection = await createStudentSelection(req.params.id, courseId, section);
    return res.status(201).json(selection);
});

router.get('/:id/selections', async (req, res) => {
    const selections = await getStudentSelections(req.params.id);
    if (selections === null) {
        throw new AppError('Your account is not a student of the BSc.IT program.', 404);
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
