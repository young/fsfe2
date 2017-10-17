'use strict';


/** WEB SOCKET */
let ws;
try {
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
          case 'load':
            console.log(data);
            return parsedData.load;

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
    .filter((load) => load !== null)
    .distinctUntilChanged()
    .subscribe(
      (load) => {
        console.log(load);
      },
      (error) => {console.error('Websocket error from server:', error);},
      () => { console.log('Done');}
    );
}
/** END WEB SOCKET */

/** SMOOTHIE */

const smoothie = new SmoothieChart();
smoothie.streamTo(document.getElementById('load-canvas'), 1200);

const line1 = new TimeSeries();
const line2 = new TimeSeries();
smoothie.addTimeSeries(line1,
  { strokeStyle:'rgb(0, 255, 0)', fillStyle:'rgba(0, 255, 0, 0.4)', lineWidth:3 });

setInterval(function() {
  line1.append(new Date().getTime(), Math.random());
  line2.append(new Date().getTime(), Math.random());
}, 1000);

/** END SMOOTHIE */

