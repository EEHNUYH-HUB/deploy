const {  parentPort } = require('worker_threads');


parentPort.on('message',(value)=>{

    const wakeUpTime = Date.now() + value*1;
    
     while (Date.now() < wakeUpTime) {
// console.log(Date.now())

     }
    parentPort.postMessage("DDDDDDD"); 

    parentPort.close();
})