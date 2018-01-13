// Dispatch (fork) asynchronous tasks and wait (join) for their completion, collecting
// failed tasks for further processing (e.g., retry logic)

const inputs = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Asynchronous function with some invalid inputs
const fun = input =>
  input.match(/[abcde]/)
    ? Promise.reject(input)
    : Promise.resolve(input.toUpperCase());

const toRejection = e => ({fulfilled: false, value: e});
const toFulfilment = o => ({fulfilled: true, value: o});
const isFulfilled = o => o.fulfilled;

const partition = (a, predicate) => {
  const out = [[], []];
  a.forEach(o => out[Number(!!predicate(o))].push(o.value));
  return out;
};

const reflect = promise => promise.then(toFulfilment).catch(toRejection);

Promise.all(inputs.map(fun).map(reflect))
  .then(outputs => partition(outputs, isFulfilled))
  .then(([rejected, resolved]) => {
    // Rejected: a,b,c,d,e
    console.log(`Rejected: ${rejected}`);
    // Resolved: F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z
    console.log(`Resolved: ${resolved}`);
  });
