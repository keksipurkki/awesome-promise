// Promise-based polling

// Runs an asynchronous function `source` indefinitely with
// a desired polling interval.

// Resolved outputs of the `source` function are fed to a `sink` function whose
// return value become the new inputs for the `source` function.

// Any JavaScript value can be returned from the `source` function, save for
// `null` which terminates the polling.

const pollingInterval = 1000; // ms

// Some asynchronous function
const source = input => Promise.resolve(input.toUpperCase());

// Called with the resolved outputs of source. Return `null` to terminate polling.
const sink = letter => {
  if (letter === 'Z') return null;
  return String.fromCharCode(letter.charCodeAt(0) + 1);
};

const poll = (source, sink, initialValue, interval) => {

  const outputs = [];

  const store = output => {
    outputs.push(output);
    return output;
  };

  const cycle = (promise, sink, done) => {
    promise
      .then(store)
      .then(sink)
      .then(
        input =>
          input === null
            ? done(outputs)
            : setTimeout(cycle, interval, source(input), sink, done)
      );
  };

  return new Promise(resolve => {
    cycle(source(initialValue), sink, resolve);
  });
};

const initialValue = 'a';
const run = poll(source, sink, initialValue, pollingInterval);

run.then(outputs => {
  console.log(`Resolved: ${outputs}`);
});
