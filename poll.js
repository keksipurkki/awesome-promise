// Promise-based polling

// Runs an asynchronous function `source` indefinitely with
// a desired polling interval.

// Resolved outputs of the `source` function are fed to a `sink` function whose
// return value become the new inputs for the `source` function.

// Any JavaScript value can be returned from the `source` function, save for
// `null` which terminates the polling.

const pollingInterval = 50; // ms

// Some asynchronous function
const source = input => Promise.resolve(input.toUpperCase());

// Called with the resolved outputs of source. Return `null` to terminate polling.
const sink = letter => {
  if (letter === 'Z') return null;
  return String.fromCharCode(letter.charCodeAt(0) + 1);
};

// Called when polling terminates.
const done = outputs => {
  console.log(`Resolved: ${outputs}`);
};

const poll = (source, sink, done, interval) => {
  const after = (interval, callback, ...args) =>
    setTimeout(callback, interval, ...args);

  const outputs = [];

  const cycle = start => out => {
    if (out === null) {
      done(outputs);
    } else {
      after(interval, start, ...out);
    }
  };

  const store = out => {
    outputs.push(out);
    return out;
  };

  return function start(...args) {
    source(...args)
      .then(store)
      .then(sink)
      .then(cycle(start));
  };
};

const run = poll(source, sink, done, pollingInterval);

const initialValue = 'a';
run(initialValue);
