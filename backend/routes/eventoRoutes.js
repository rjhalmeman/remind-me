const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventoController');

router.get('/menu', controller.listarMenu);
router.put('/status/:id', controller.atualizarStatus);

router.get('/', controller.listar);
router.post('/', controller.criar);
router.delete('/:id', controller.deletar);

module.exports = router;