'use strict';


/** WEB SOCKET STUFF */
let ws;
try {
  ws = new WebSocket(`ws://localhost:3001`);
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
/** END WEB SOCKET STUFF */