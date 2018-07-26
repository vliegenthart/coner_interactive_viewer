// https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0
// https://hackernoon.com/restful-api-design-with-node-js-26ccf66eab09

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use('/api/v1' , require('./routes'))

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));

