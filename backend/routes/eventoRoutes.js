const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventoController');

router.get('/menu', controller.listarMenu);
router.get('/:id', controller.buscarPorId);

router.get('/', controller.listar);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

router.put('/status/:id', controller.atualizarStatus);

module.exports = router;