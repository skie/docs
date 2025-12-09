---
title: "Flows: collections, pipelines and pipes"
date: 2022-01-22
description: Explore data flow patterns in PHP including collections processing, pipeline design patterns, and Railway Oriented Programming for handling complex data transformations and error management.
tags:
  - PHP
  - Railway programming
  - Functional Programming
  - CakePHP
  - Collections
  - Pipelines
---

# Flows: collections, pipelines and pipes


## Data flows: collections processing

Manipulating lists, arrays, and any iterable objects is a common task.
Functional languages provide many conventional higher-order functions to solve this task.
In general, most libraries follow functional language naming conventions, with minor exceptions like LINQ.
The most common operations are:
* `map` &mdash; transforms one collection into another.
* `filter` &mdash; removes some data from a collection.
* `reduce` or `fold` &mdash; folding, and in general applying a catamorphic operation to the collection, which allows generating a new atomic value or structure.
* `take` &mdash; extracts the first n elements from the collection.
* `any` and `all` &mdash; check the condition for one or all elements in the collection.
* `chunk` &mdash; divides a collection of elements into a collection of chunks.
* `flatMap` &mdash; applies a function to each value in a collection (which in most cases is a collection itself) and flattens the result.
* `zip` &mdash; groups together elements from different collections.

It is very important that collection operations use lazy evaluation. Lazy lists are a very effective approach when processing large data sets. In PHP, there are two common approaches to implement such libraries: iterators and generators.

### Application area

The usage of collection-oriented libraries is limited to data processing and manipulation of collections of elements, coming from databases or user interfaces. Another possible use case is event stream processing, which is used in reactive programming approaches.

### Some libraries provide collections API.

1. [nikic/iter](https://github.com/nikic/iter)

Library from Nikita Popov, who is known as a core PHP developer. It actively uses generators
and is one of the fastest collection implementations. It implements common methods like `filter`, `map`, `reduce`, `all`, `any`, `take`, `slice`, `chunk`.

2. [cakephp/collection](https://github.com/cakephp/collection)

Library that comes with the CakePHP framework, built using PHP iterators. It has comparable speed to the previous library, making it competitive with the nikic/iter library.

3. [loophp/collection](https://github.com/loophp/collection)

Library that extensively uses lazy collections, consuming PHP's generators and iterators. This library has a really rich API compared to the previous libraries. It is strictly typed with PHP and phpstan generics type hints. All operations are curried, and the library has not only generic methods but also features like the anamorphic `unfold` method.

It may not be as fast as the previously listed libraries, but its flexibility shows it is really promising.

## Logic flows: pipelines

_Pipelines_ are very similar to the popular pattern used in web development: middlewares. Like middlewares, _pipelines_ consist of steps performed one by one and allow composing sequential stages through chaining.

However, while middleware always has input and output data defined (like request and response) and is generalized, in the case of pipelines, the processed data can be task-specific.

[The Pipeline Design Pattern](https://java-design-patterns.com/patterns/pipeline/) is used for splitting complex processes into independent tasks. Each task is reusable, and such tasks can be composed into different processes. This allows breaking down monolithic processes into smaller parts that process data and then pass that data to the next step.

Most users of operating systems are familiar with piping the output from one command to be the input of another command.

For example:

```bash
cat words-list.txt | sort | uniq | wc -l
```

This command reads a text file, sorts it, and calculates the amount of unique lines. Each task performed by separate command, and data passed from one to another to complete the task.


### Application area

[The Pipeline Design Pattern](https://java-design-patterns.com/patterns/pipeline/) is recommended for use in the following cases:

* Execute individual stages that yield a final value.
* Add readability to complex sequence of operations by providing a fluent builder as an interface.
* Improve testability of code since stages will most likely be doing a single thing, complying to the Single Responsibility Principle.

Good examples of the pipeline pattern are middlewares. Such middlewares act as onion layers and are processed one by one, following the pipeline order.
Another example is an image or video transformation command chain, which is performed for uploaded images. This could include image resizing, building thumbnails, and uploading to cloud storage.

### Some libraries implement a pipeline pattern.

1. [league/pipeline](https://github.com/thephpleague/pipeline)

Flexible library that implements the pipeline pattern. The implementation is simple and fast, and at the same time allows extending the pipeline behavior as it provides a set of interfaces for that.

> “This package provides a plug and play implementation of the Pipeline Pattern. It’s an architectural pattern which encapsulates sequential processes.  When used, it allows you to mix and match operations, and pipelines, to create new execution chains. The pipeline pattern is often compared to a production line, where each stage performs a certain operation on a given payload/subject. Stages can act on, manipulate, decorate, or even replace the payload.
> If you find yourself passing results from one function to another to complete a series of tasks on a given subject, you might want to convert it into a pipeline.”


2. [illuminate/pipeline](https://github.com/illuminate/pipeline)

This library is a very important part of the Laravel framework and acts as the basis of Laravel's implementation of middlewares.

### Limitations

For any step of the pipeline, the processor function input should be composable with the output of the previous step's processor function. So the general recommendation is to define each processor in the pipeline to receive and emit the same type of data. This allows processors to be added, removed, or replaced from the pipeline without changing the other tasks. This is not a real limitation, but it reduces the reusability of the processor functions.

Pipelines were created mainly for linear flow processing. Another problem is error handling, which needs to be implemented separately and is not generalized by the pipeline library. This could be solved with conditional pipeline executors, which make the pipeline's implementation more complex. Another solution is throwing exceptions from a specific stage, but in general, a user will still need additional logic for processing exceptions outside of the pipeline.

Next methodology created to resolve listed challenges.

## Railway oriented programming

The term `Railway Oriented Programming` (**ROP**) was initially introduced by Scott Wlaschin in his [article](https://fsharpforfunandprofit.com/posts/recipe-part2) in 2013.
As he said, many examples in programming assume that you are always on the "happy path". But to create a robust real-world application, you must deal with validation, logging, network and service errors, and other annoyances.
So, how do you handle all this in a clean functional way? The methodology provides a brief introduction to this topic, using a fun and easy-to-understand railway analogy. In general, the idea is simple. When we deal with side effects, there are two possible cases: either the data is valid (the happy path), or something is wrong, in which case we go onto the failure path and bypass the rest of the steps.

The important part of the **ROP** approach is providing a way to compose functions that pass through two-way flow.

It is really important to understand that the **ROP** pattern is a direction, not a rule. It is not about coding style, but rather acts as a methodology pattern about improving code efficiency and reliability.
Patterns have advantages and disadvantages. Developers try to balance between them. So, we should consider railway oriented programming as a possible choice rather than a rule we always have to follow. The author of the **ROP** pattern has a great article [Against Railway-Oriented Programming (when used thoughtlessly)](https://fsharpforfunandprofit.com/posts/against-railway-oriented-programming/).

Here I list some reasons when `Railway Oriented Programming` is a good option to consider:

* Code is much simpler and more readable.
* Each function will always yield either a failure or a success.
* The composable **ROP** approach is well suited when business logic is switched at runtime. Each function can be considered as a black box and does not disturb the next function during maintenance by the developer.
* Good testability, because of atomizing the flow parts into separate independent functions.

### Implementations

We can consider several different implementations to keep data state on two-way track flow.

First of all, we can use tuples to store result values. This approach is actively used in languages like Elixir, where success data is tagged with the :ok atom, and failure is tagged with :error. This approach would work well with PHP arrays.
A more complex option is using the *Either monad* implemented as class inheritance with two children: Right and Left classes, which represent results. Not long ago, a good article [Either why or how](https://marcosh.github.io/post/2021/09/24/either-why-or-how.html) was presented, analyzing how the Either monad is implemented in different languages, including PHP.

### Few words about composition

The most obvious approach is to use a functional approach using functions like `map`, `bind`, `tee`, `double map`, `plus` that operate with methods using Either instances as data and callbacks with different type signatures.
As an alternative to the general approach, we can also consider a modified pipeline approach with a payload class enriched with a set of functions. This approach does not have common conventions, but is internally based on a functional approach. This approach to **ROP** implementation is actively used in languages like C# or Java.


