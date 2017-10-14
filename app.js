'use strict';

const express = require('express');
const WebSocketServer = require('ws').Server;
const server = require('http').createServer();

const wss = new WebSocketServer({ server: server });
const app = express();

const PORT = 3001;

/** ROUTES **/
app.use('/static', express.static('static'));

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

app.get('/slowfile', function(req, res) {
  setTimeout(() => {
    res.sendFile('index.html', {root: __dirname});

  }, 15 * 1000);
});

/** END ROUTES **/

wss.on('connection', function connection(ws) {
   console.log('client connected ');

  ws.on('message', function incoming(message) {
    try {
      const parsedData = JSON.parse(message);
      if (parsedData.name !== 'pong') {
        console.dir(parsedData);
      }

    } catch(e) {
      console.error('Error from message: ', e);
    }
  });

  if (ws.readyState === ws.OPEN) {
    ws.send('welcome!');
  }

});


/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};


server.on('request', app);
server.listen(PORT, function () { console.log('Listening on ' + PORT); });
