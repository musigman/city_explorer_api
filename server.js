'use strict';
require('dotev').config();

const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT;

app.get('/', (request, response) => {
  console.log('response body:', response.body);
  console.log('request method', request.method);
  response.send('Hello Funky Chicken!');
});

app.get('/some-path', (request, response) => {
  response.json({ message: 'Hello from json land' });
});

app.get('bad-request', (request, response) {
  throw new Error('bad request!');
}

app.listen(PORT, ()=> {
  console.log(`listening on port: ${PORT}`);
});