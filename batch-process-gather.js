// Group tasks into batches, apply a series of asynchronous transformations and gather results

const chunkSize = 3;
const timeout = 1000; // ms
const inputs = "abcdefghijklmnopqrstuvwxyz".split("");

const chunker = n => {
  return (acc, elem, i) => {
    const j = Math.floor( i / n );
    (acc[j] = acc[j] || []).push(elem);
    return acc;
  };
};

// Some asynchronous function
const fun = input => new Promise(resolve => setTimeout(resolve, timeout, input.toUpperCase()));

// Some function that is called as soon as *all* the tasks are fulfilled
const gather = outputs => outputs.reduce((a,b) => [...a, ...b], []);

const apply = (acc, val) => acc.then(val);
const compose = (...funcs) => x => funcs.reduce(apply, Promise.resolve(x));

const batch = a => a.reduce(chunker(chunkSize), []);
const process = f => batches => Promise.all(batches.map(batch => Promise.all(batch.map(f))));

const run = compose(batch, process(fun), gather);

console.time("batch-process");
run(inputs).then(outputs => {
  // After ~1000 ms
  console.log(`Resolved: ${outputs}`);
  console.timeEnd("batch-process");
});
