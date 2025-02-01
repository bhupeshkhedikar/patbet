const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const razorpayRoutes = require('./routes/razorpayRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/razorpay', razorpayRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
