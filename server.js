'use stric';

const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

//turning it on
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});




