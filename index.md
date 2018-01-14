# Promise-based patterns for asynchronous programming

### Fork-join

Many problems in asynchronous programming take the form of dividing a
task into sub-tasks and processing the sub-tasks concurrently. That is,
a set of inputs is mapped to a function that is evaluated
asynchronously, after which the results are *joined* into a single
result.

If it takes O(N) time to process N tasks sequentially, the fork-join
model can cut the time down to O(N/k) where k is the degree of
parallelism. An added advantage of the fork-join model is that
unpredictable overheads associated with any given sub-task do not cause
head-of-line blocking.

The fork-join model is well established and was first formulated already
in in the 1960s. It is supported out of the box by the Promise API with
the `Promise.all` function.

#### Caveats

When creating a collection of promises, all the promises are dispatched
for execution immediately which can quickly consume all the available
computational resources. In addition, the function `Promise.all` returns
a promise that is rejected as soon as *any* of the sub-promises is
rejected. Both of these behaviors must be altered to accommodate
features such as error recovery, proper resource managements and so on.
As such, the `Promise.all` function is best regarded as a building block
for more advanced patterns.

### Reflect

In real world applications, things fail all the time, making the
rejection policy of the `Promise.all` function too rigid. Luckily, we
can write a function on top of `Promise.all` which allows us to gather
resolved outputs and rejected inputs together, and pass both as
arguments for further processing.

The inputs are processed as with the fork-join model except that when
the original asynchronous calls resolve with either a rejection or
fulfillment, both cases are accounted for by wrapping the values into
intermediate objects that contain information about which of the two
possible outcomes occurred.

This *reflection* step is then followed by a partition step where the
intermediate objects are grouped into two arrays depending on whether the
object represents an fulfilled value or a rejection. Finally, the
resolved and rejected values are *unreflected* and returned for further
processing.

It is then a simple matter to decide what to do with the rejected
inputs. Perhaps processing should be retried at a later time, or perhaps
the errors should be merely logged and discarded.

### Batch-fork-join

When a basic fork-join approach overwhelms the available resources, we
can overcome the limitations by first grouping the inputs into batches
and working with bigger "chunks" of the inputs. Batching reduces the
overhead associated with starting and completing a single task. In
networking context, when the size of request headers outweighs the
request body, common sense dictates that more time is spent on
transmitting metadata than actual data.

If the cost of the workload is O(N(o + W)), where N is the number of
tasks, W is work proper and o is the overhead per task, batching the
inputs into k groups reduces the cost to O(ko + NW). Batch processing
also opens up the avenue for other performance improvements. As a
general guideline, modern CPUs are at their best when they are given
sufficiently big and deterministic workloads with good data and time
locality characteristics. 

In typical web development scenario, batch processing requires support
from the back-end. This poses no problem when working with databases --
you just write your queries in a batched manner. Or when following the
best practices of REST API design, you merely point your requests to
collection endpoints instead of individual resources. That is, instead
of a POST request to `/api/cat`, you would submit a request to
`/api/cats/`. When it comes to 3rd party APIs, your mileage will
obviously vary.

### Queue-throttle

There are times when we want to have guaranteed control over
computational resources. This situation occurs when we cannot control
the rate at which tasks are created or when working under some external
constraints such as a rate-limited REST API with a known request budget.
In addition, sometimes we want a variant of our batch processing code,
where we want to nonetheless wait for batches to complete before
dispatching new ones for execution.

The solution in all of these cases it to *queue* the tasks and process
them one by one. In a way, queueing returns us back into sequential
code, with the difference that within a single task all the techniques
of asynchronous programming are once again at our disposal. As such,
some kind of a task queue should be the highest level construct of any
kind batch processing system.

An queue object should also be the starting point for parallelizing a
batch processing system at the process level. If the state of the queue
is stored in a database, multiple instances of a batch processing system
can snatch tasks of the queue and process them in parallel. It is not
difficult to envision a system where the whole process occurs
elastically

### Poll

In all of the previous examples, the set of inputs was known beforehand.
When this is not the case, we often have to *poll* for data from some
kind of a *source*. We then pass this data to some kind of a *sink* that
consumes it.

The poll pattern establishes an asynchronous control flow by connecting
the outputs of the *source* function into the inputs of the *sink*
functions, and the outputs of the sink function to the new inputs of the
source function, so closing a loop.

It is then a simple matter to implement control logic to for example
stop the polling when a certain condition is met. A conventional
function contract would be to stop polling whenever the source function
receives `null` as its input, akin to the way in which NodeJS streams
operate.
