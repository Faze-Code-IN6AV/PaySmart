import { Router } from 'express';
import {
  createFavorite,
  getFavorites,
  editFavorite,
  removeFavorite
} from './favoriteAccount.controller.js';
import {
  deactivateFavorite,
  activateFavorite
} from './favoriteAccount.controller.js';


import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/', validateJWT, createFavorite);
router.get('/', validateJWT, getFavorites);
router.put('/:id', validateJWT, editFavorite);
router.delete('/:id', validateJWT, removeFavorite);
router.patch('/:id/deactivate', validateJWT, deactivateFavorite);
router.patch('/:id/activate', validateJWT, activateFavorite);
export default router;