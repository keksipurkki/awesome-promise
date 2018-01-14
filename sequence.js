const inputs = 'abcdefghijklmnopqrstuvwxyz'.split('');

const sleep = () => Math.floor(1000 * Math.random());
const fun = input => new Promise(resolve => setTimeout(resolve, sleep(), input.toUpperCase()));

const apply = (acc, val) => acc.then(val);
const compose = (...funcs) => x => funcs.reduce(apply, Promise.resolve(x));
const sequence = (f, inputs) => compose(...inputs.map(input => () => f(input)))();

let outputs = [];

const store = output => {
  outputs.push(output);
  return output;
};

sequence(compose(fun, store, console.log), inputs).then(() => {
  console.log(`Resolved: ${outputs}`);
});
