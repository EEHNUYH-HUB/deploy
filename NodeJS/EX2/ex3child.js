const { parentPort } = require('worker_threads');


parentPort.on('message', (ms) => {

    var start = new Date();
    const wakeUpTime = Date.now() + parseInt(ms);
    while (Date.now() < wakeUpTime) {

    }
    var end = new Date();
    var str = `시작:${start.getMinutes()}분 ${start.getSeconds()}초
     <br /> 종료:${end.getMinutes()}분 ${end.getSeconds()}초`


    parentPort.postMessage(str);
    parentPort.close();
})