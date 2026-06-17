const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Suebem App</h1>');
});

app.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});
