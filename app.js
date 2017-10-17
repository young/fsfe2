'use strict';

const express = require('express');
const WebSocketServer = require('ws').Server;
const server = require('http').createServer();
const exec = require('child_process').exec;

const wss = new WebSocketServer({ server: server });
const app = express();

const PORT = 3001;

/** ROUTES **/

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

app.get('/load', function(req, res) {
  res.sendFile('load.html', {root: __dirname});
});

app.get('/cats', function(req, res) {
  res.sendFile('cats.html', {root: __dirname});
});

app.get('/slowfile', function(req, res) {
  setTimeout(() => {
    res.sendFile('index.html', {root: __dirname});
  }, 6 * 1000);
});

/** END ROUTES **/

let pushDataInterval;

wss.on('connection', function connection(ws) {
   console.log('clients connected: ', wss.clients.size);

  if (!pushDataInterval) {
    pushDataInterval = getServerLoad();
  }

  if (ws.readyState === ws.OPEN) {
    ws.send('welcome!');
  }

  ws.on('close', function close() {
    if (wss.clients.size === 0) {
      clearInterval(pushDataInterval);
      pushDataInterval = null;
    }
    console.log('disconnected');
  });

  ws.on('error', function error() {
    console.log('error');
  });
});

/**
 * Run shell script on an interval and broadcast to connected clients.
 * @return {Object} The interval object
 */
function getServerLoad() {
  return setInterval(() => {
    const loadScript = exec(`./proc.sh`);

    loadScript.stdout.on('data', function(data) {
      wss.broadcast(JSON.stringify({name: 'load', data}));
    });

  }, 4 * 1000);
}

/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */
wss.broadcast = function broadcast(data) {
  console.log('Broadcasting: ', data);
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};


server.on('request', app);
server.listen(PORT, function () { console.log('Listening on ' + PORT); });
