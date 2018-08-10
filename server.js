// https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0
// https://hackernoon.com/restful-api-design-with-node-js-26ccf66eab09

const express = require('express');

const app = express();

const port = process.env.PORT || 5000;

app.use('/api/v1' , require('./routes'))

app.listen(port, () => console.log(`Listening on port ${port}`));

