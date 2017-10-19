/*global Rx, SmoothieChart, TimeSeries */
'use strict';
/** SMOOTHIE */

// Initialize smoothie
const smoothie = new SmoothieChart({
  millisPerPixel: 87,
  tooltip: true
});

smoothie.streamTo(document.getElementById('load-canvas'), 2 * 1000);

const line1 = new TimeSeries();
const line2 = new TimeSeries();
const line3 = new TimeSeries();

smoothie.addTimeSeries(line1);
smoothie.addTimeSeries(line2, {lineWidth:2, strokeStyle:'#00ff00'});
smoothie.addTimeSeries(line3, {lineWidth:2, strokeStyle:'#d8ce7a'});
/** END SMOOTHIE */



/** WEB SOCKET */
let ws;
try {
  // Choose correct websocket proto
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${window.location.host}`);
} catch(e) {
  //
}

const pongPayload = JSON.stringify({name: 'pong'});

// Local dev only
// const ws = new WebSocket(`ws://localhost:4080`);
if (ws) {
  Rx.Observable.fromEvent(ws, 'message', ({data}) => {
      try {
        const parsedData = JSON.parse(data);
        switch(parsedData.name) {
          // Handle server load data
          case 'load':
            return parsedData.data.split('-');

          // Respond to pings
          case 'ping':
            ws.send(pongPayload);
            console.info('pong');
            break;

          default:
            return null;
        }
        return null;

      } catch(e) {
        console.log(`SERVER MESSAGE: ${data}`);
        return null;
      }
    })
    .filter(load => load && load.length)
    .subscribe(
      load => {
        const now = new Date().getTime();
        // Append data to chart
        line1.append(now, load[0] * 100);
        line2.append(now, load[1] * 100);
        line3.append(now, load[2] * 100);
      },
      (error) => {console.error('Websocket error from server:', error);},
      () => { console.log('Done');}
    );
}
/** END WEB SOCKET */



