// Group tasks into batches, apply an asynchronous transformation one batch at a time

const chunkSize = 3;
const timeout = 1000; // ms
const inputs = "abcdefghijklmnopqrstuvwxyz".split("");
let result = [];

const chunker = n => {
  return (acc, elem, i) => {
    const j = Math.floor( i / n );
    (acc[j] = acc[j] || []).push(elem);
    return acc;
  };
};

// Some asynchronous function
const fun = input => new Promise(resolve => setTimeout(resolve, timeout, input.toUpperCase()));

// Some function that is called whenever *any* batch is processed
const gather = outputs => {
  result = [...result, ...outputs];
};

const apply = (acc, val) => acc.then(val);
const compose = (...funcs) => x => funcs.reduce(apply, Promise.resolve(x));

const batch = a => a.reduce(chunker(chunkSize), []);
const sequence = f => batches => compose(...batches.map(batch => () => f(batch)))();
const process = batch => Promise.all(batch.map(fun));
const run = compose(batch, sequence(compose(process, gather)));

console.time("sequence");
run(inputs).then(() => {
  // After ~ numBatches * 1000 ms
  console.timeEnd("sequence");
  console.log(`Resolved: ${result}`);
});
