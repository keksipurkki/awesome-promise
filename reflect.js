// Dispatch (fork) asynchronous tasks and wait (join) for their completion, collecting
// failed tasks for further processing (e.g., retry logic)

const inputs = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Asynchronous function with some invalid inputs
const fun = input =>
  input.match(/[abcde]/)
    ? Promise.reject(new Error('Invalid input'))
    : Promise.resolve(input.toUpperCase());

const reject = (error, input) => ({fulfilled: false, input, error});
const fulfill = value => ({fulfilled: true, value});
const isFulfilled = o => o.fulfilled;

const partition = (a, predicate) => {
  const out = [[], []];
  a.forEach(o => out[Number(!!predicate(o))].push(o));
  return out;
};

const reflect = (f, input) =>
  f(input)
    .then(fulfill)
    .catch(error => reject(error, input));

const unreflect = ([rejected, resolved]) => {
  resolved = resolved.map(r => r.value);
  rejected = rejected.map(({input, error}) => ({input, error}));
  return [rejected, resolved];
};

function exec(f, inputs) {
  return Promise.all(inputs.map(input => reflect(f, input)))
    .then(outputs => partition(outputs, isFulfilled))
    .then(unreflect);
}

exec(fun, inputs).then(([rejected, resolved]) => {
  // Rejected: a,b,c,d,e
  console.log(`Rejected: ${rejected.map(r => r.input)}`);
  console.log(`Errors: ${rejected.map(r => r.error.message)}`);
  // Resolved: F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z
  console.log(`Resolved: ${resolved}`);
});
