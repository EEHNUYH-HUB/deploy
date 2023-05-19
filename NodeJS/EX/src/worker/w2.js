const { workerData, parentPort } = require('worker_threads');

const data = workerData; 


const wakeUpTime = Date.now() + data.count*1;

while (Date.now() < wakeUpTime) {


}
parentPort.postMessage("DDDDDDD"); 

parentPort.close();
