// server/index.js
const express = require('express');
const app = express();
const loadBalancerRoutes = require('./routes/loadBalancerRoutes');

app.use(express.json());
app.use('/api', loadBalancerRoutes);

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Load Balancer running on port ${PORT}`);
});
