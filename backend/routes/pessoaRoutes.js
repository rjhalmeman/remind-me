const express = require('express');
const router = express.Router();
const controller = require('../controllers/pessoaController');

// Rotas existentes
router.get('/', controller.listar);
router.post('/', controller.criar);

// Novas rotas para o CRUD completo
router.get('/:id', controller.buscarPorId); // Buscar por ID
router.put('/:id', controller.atualizar);   // Atualizar
router.delete('/:id', controller.deletar);  // Deletar

module.exports = router;