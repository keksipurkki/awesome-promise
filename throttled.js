const inputs = 'abcdefghijklmnopqrstuvwxyz'.split('');
const throttleThreshold = 5; // calls/s

let callCount = 0;

const apply = (acc, val) => acc.then(val);
const compose = (...funcs) => x => funcs.reduce(apply, Promise.resolve(x));

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
    return new Promise(resolve => setTimeout(compose(f, resolve), coolOff(), ...args));
  };
}

const randomTime = (min = 0, max = 1000) => () => {
  return Math.random()*(max - min) + min;
};

const sleep = randomTime(0, 0);

// Some asynchronous function
const fun = input => {
  console.log(`I was invoked with ${input}`);
  return new Promise(resolve => setTimeout(resolve, sleep(), input.toUpperCase()));
};

const toc = +new Date();
Promise.all(inputs.map(throttled(fun)))
  .then(outputs => {
    const tic = +new Date();
    console.log(`Resolved: ${outputs}`);
    console.log(`Target: ${throttleThreshold}, got ${1000 * inputs.length / (tic - toc)}`);
  })
  .catch(console.error);
