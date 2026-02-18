import express from 'express';
import {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
} from '../controllers/serviceController.js';
import { protect, providerOrAdmin, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, providerOrAdmin, createService)
    .get(getServices);

router.route('/:id')
    .get(getServiceById)
    .put(protect, providerOrAdmin, updateService)
    .delete(protect, admin, deleteService);

export default router;
