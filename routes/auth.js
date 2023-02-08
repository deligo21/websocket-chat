import { Router } from 'express';
import { body } from 'express-validator';
import { googleSignIn, login, renovarToken } from '../controllers/auth.js';
import {validarCampos} from '../middlewares/validar-campos.js';
import {validarJWT} from '../middlewares/validar-jwt.js';

const router = Router();

router.post('/login', [
    body('correo', "El correo es obligatorio").isEmail(),
    body('password', 'La contrasena es obligatoria').not().isEmpty(),
    validarCampos
], login);

router.post('/google', [
    body('id_token', "El ID-Token de Google es necesario").not().isEmpty(),
    validarCampos
], googleSignIn);

router.get('/', validarJWT, renovarToken)

export default router;