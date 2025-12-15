const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define a rota POST /login que chama a função corrigida
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;