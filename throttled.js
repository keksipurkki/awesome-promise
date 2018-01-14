const inputs = 'abcdefghijklmnopqrstuvwxyz'.split('');
const throttleThreshold = 3; // calls/s

let callCount = 0;


const rateLimit = threshold => {
  const start = +new Date();
  threshold /= 1000;
  return () => {
    let elapsed = +new Date();
    elapsed -= start;
    return Math.max(0, (callCount / threshold) - elapsed);
  };
};

const coolOff = rateLimit(throttleThreshold);

function throttled(f) {
  return (...args) => {
    ++callCount;
    return new Promise(resolve => setTimeout(resolve, coolOff(), f(...args)));
  };
}

// Some asynchronous function
const randomTime = (min = 0, max = 1000) => () => {
  return Math.random()*(max - min) + min;
};

const sleep = randomTime(0, 3000);

const fun = input => new Promise(resolve => setTimeout(resolve, sleep(), input.toUpperCase()));

//
//const apply = (acc, val) => acc.then(val);
//const compose = (...funcs) => x => funcs.reduce(apply, Promise.resolve(x));
//const queue = (f, inputs) => compose(...inputs.map(input => () => f(input)))();
//
//let outputs = [];
//
//const store = output => {
//  outputs.push(output);
//  return output;
//};
//
//const throttle = input => {
//  const [seconds, nanos] = process.hrtime(start);
//  const callRate = callCount++ / seconds;
//  if (!isNaN(callRate) && callRate < throttleThreshold)
//    return Promise.resolve(input);
//  return new Promise(resolve =>
//    setTimeout(resolve, 1000 * (callRate - throttleThreshold), input)
//  );
//};
//
//queue(compose(throttle, fun, store, console.log), inputs).then(() => {
//  console.log(`Resolved: ${outputs}`);
//});


const toc = +new Date();
Promise.all(inputs.map(throttled(fun)))
  .then(outputs => {
    const tic = +new Date();
    console.log(`Resolved: ${outputs}`);
    console.log(`Target: ${throttleThreshold}, got ${1000 * inputs.length / (tic - toc)}`);
  })
  .catch(console.error);
