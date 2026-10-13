const express = require('express');
const router = express.Router();

router.post('/load', (req, res) => {
  const { type, payload } = req.body;
  console.log('Received:', type, payload);

  // You can replace this with your actual logic
  res.json({ message: `Received ${type} load`, data: payload });
});

module.exports = router;
