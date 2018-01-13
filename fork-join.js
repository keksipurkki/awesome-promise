// Dispatch (fork) asynchronous tasks and wait (join) for their completion.
// An error in any task causes the all the outputs to be discarded

const timeout = 1000; // ms
const inputs = "abcdefghijklmnopqrstuvwxyz".split("");

// Some asynchronous function
const fun = input => new Promise(resolve => setTimeout(resolve, timeout, input.toUpperCase()));

Promise.all(inputs.map(fun)).then(outputs => {

  // Resolved: A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z
  console.log(`Resolved: ${outputs}`);

}).catch(error => {

  // Some promise was rejected, outputs discarded

});
