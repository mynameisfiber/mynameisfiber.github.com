---
layout: post
type: blog
title: python bytecode hacking
tagline: speed up for great victory
date: 2015-04-23
categories : [projects, code]
tags : [python, hack, bytecode, performance]
---

As an exercise into learning more about python 2.7 bytecode, I wanted to
implement the thing that pythonistas [love to hate][guido] - tail call
optimization! This isn't [novel][rubber] at all, but I chose to implement this
only using the standard library so that I could understand more about generating
and modifying bytecode.  As a result, I'm sure there are _many_ edge cases that
I don't consider so please, keep your sys-ops sane and *do not use this code in
production*.  [In the end][pytailcall], even though the code is fun it is a
filthy hack that shouldn't be used in production code and should never be
considered to make it's way into the python source.  One point I really like on
[Guido's blog post][guido] about this issue is tail recursion optimization ruins
the stack traces and detracts from python's ability to debug easily.

Tail calls are when a function is recursing and returns simply on a function
call to itself.  This is different than normal recursion where multiple things
can be happening on our recursed return statement.  So, for example, this is
tail recursion,

```
def factorial(N, result=1):
    if N == 1:
        return 1
    return factorial(N-1, N*result)
```

While this is not,

```
def factorial(N):
    if N == 1:
        return 1
    return N * factorial(N-1)
```

So we can see that normal recursion uses the return register in order to
maintain the state of the calculation.  By contrast, tail recursion uses a function
parameter.  This is made particularly simple in python because you can have keyword
arguments with default values to initialize the calculation.

The thing that makes tail calls particularly useful is the ability to optimize
them.  Generally when a function gets called, the system must set up a function
stack in memory that maintains the state of the function, including local
variables and code pointers, so that the function can go on its merry way.
However, when we do a tail recursion we are trying to enter the same function
stack that we are already in, just with changes to the values of the arguments!
This can be quickly optimized by never creating the new function stack and
instead just modifying the argument values and starting the function from the
beginning!

One way of doing this is manually unravelling the recursion.  For our example
above, the factorial would become,

```
def factorial(N, result=1):
    while True:
        if N == 1:
            return result
        N, result = N-1, N*result
```

Not only will this speed up our code, but we also don't have to worry about
those pesky [recursion limits][pyreclimit] that python imposes on us.
Furthermore, the transformation is quite simple.  All we did was add a `while
True:` to the beginning of the function and change any tail calls with changes
to the argument variables.

There are a whole host of methods to do this automatically ([partial
functions][partial], [exceptions][], etc., but I thought it would be fun to do
this by re-writing the bytecode of the function itself.  Let's start by looking
at the actual bytecode of the `factorial` function using the `dis` module from
the standard library.

```
>>> dis.dis(factorial)
# bytecode                                             # relevant python
# -----------------------------------------------------#---------------------
  2           0 LOAD_FAST                0 (N)         # if N == 1:
              3 LOAD_CONST               1 (1)         # 
              6 COMPARE_OP               2 (==)        # 
              9 POP_JUMP_IF_FALSE       16             # 
                                                       # 
  3          12 LOAD_CONST               1 (1)         #    return 1
             15 RETURN_VALUE                           # 
                                                       # 
  4     >>   16 LOAD_GLOBAL              0 (factorial) # return factorial(N-1, N*result)
             19 LOAD_FAST                0 (N)         # 
             22 LOAD_CONST               1 (1)         # 
             25 BINARY_SUBTRACT                        # 
             26 LOAD_FAST                0 (N)         # 
             29 LOAD_FAST                1 (result)    # 
             32 BINARY_MULTIPLY                        # 
             33 CALL_FUNCTION            2             # 
             36 RETURN_VALUE                           # 
```

We can see the full structure of our function in the bytecode.  First we load
up `N` and the constant `1` and compare them using the `COMPARE_OP` bytecode.
If the result if false, we jump to line 16 and if not we load the constant `1`
back into the stack and return it.  On line 16, we first load the reference to
the function named `factorial` (which happens to be the same function we're in!)
and start building up the arguments.  First we load up `N` and `1` and call
`BINARY_SUBTRACT` which will leave the value of `N-1` on the stack.  Then we
load up `N` and `result` and multiply them with `BINARY_MULTIPLY` which will
push the value of `N-1` onto the stack.  By calling the `CALL_FUNCTION`
bytecode (with the argument `2` indicating that there are two arguments to the
function), python can go out and start running the function in another context
until it returns and we can call `RETURN_VALUE` on line 36 to return whatever is
left in the stack. This may seem like a convoluted way of approaching how a
function works (although it [has its uses][hpp]!), but after a while spent
looking at [opcodes][] this starts to make just as much sense as python itself!

In an ideal world, what would we want this bytecode to look like? Looking up
the references on `JUMP_ABSOLUTE`, we can rewrite the above bytecode to be,

```
  2     >>    0 LOAD_FAST                0 (N)
              3 LOAD_CONST               1 (1)
              6 COMPARE_OP               2 (==)
              9 POP_JUMP_IF_FALSE       16

  3          12 LOAD_CONST               1 (1)
             15 RETURN_VALUE        

  4     >>   16 LOAD_FAST                0 (N)
             19 LOAD_CONST               1 (1)
             22 BINARY_SUBTRACT     
             23 LOAD_FAST                0 (N)
             26 LOAD_FAST                1 (result)
             29 BINARY_MULTIPLY     
             30 STORE_FAST               1 (result)
             33 STORE_FAST               0 (N)
             36 JUMP_ABSOLUTE            0
```

The differences here start at line 16.  Instead of loading a reference to the
recursed function, we immediately start filling up the stack with what _were_
the arguments to the function.  Then, once our arguments have been computed,
instead of doing a `CALL_FUNCTION`, we start running a sequence of `STORE_FAST`
to pop the calculated arguments off the stack and into the actual argument
variables.  Now that the arguments have been modified, we can call
`JUMP_ABSOLUTE` with an argument of `0` in order to jump back to the beginning
of the function and starting again.  This last aspect, the `JUMP_ABSOLUTE` back
to the beginning of the function as oppose to setting up a while loop, is one of
the reasons this function is faster than the manual unrolling of the recursion
we did above; we don't need to calculate the conditions of the loop or do any
modifications to our state, we simply start processing opcodes at line 0 again.

This may seem simple, but there are many corner cases that will get you (and in
fact got me in the hours of `SystemError` exceptions I wrestled with).  First of
all, if the recursive return is already within what python calls a block (ie: a
loop or a try..except..finally block), we need to call the `POP_BLOCK` opcode
the right amount of times before our `JUMP_ABSOLUTE` so that we properly
terminate any setup those sections need.

Another problem, and probably much more annoying than the block counts, is that
of changing the size and thus the addresses of the bytecodes.  When bytecode is
represented, it is simply a list of unsigned four-bit integers.  Some of these
integers represent jumps to other points in the list, and it refers to those
other points by either relative offsets (e.g., jump five integers to the right)
or by absolute addresses (e.g., jump to the tenth integer).  In order to make
sure these jumps go to the correct place after we modify the bytecode, we must
keep a list of what we added (and where) and, once our editing is done, go back
through and modify any addresses to again point to the correct place.

Once all these problems are solved, we are left with a [general
decorator][decorator] to transform all of our tail recursion into the iterative
versions!  And this is indeed much faster.  Looking at the benchmark supplied
with [pytailcall][], we can see that we reduce the overhead of recursion (by
eliminating it) and are able to recurse much more than we were previously able
to.

![](http://i.imgur.com/OodCK0c.png)

In this benchmark, `native` is the original function. `partial_func` is a trick
which wraps the function in a partial and changes it's internal reference to
itself. `return_tuple` is another bytecode hack that changes the recursion into
a specialized return statement that triggers another call to the function.
Finally, `internal_loop` is the bytecode hack described above.

So, by committing this ungodly sin against all things python stands for, we can
get a 33% speedup over python tail recursed code!  In general though, this was a
great exercise in learning much more about how python bytecode works and the
underlying structure of a function.  While this sort of bytecode hacking is
exactly that, a hack, being able to read bytecode and understand the output of
`dis.dis` is incredibly useful when optimizing python code for actual production
systems.  If you want to know more about _that_ aspect of the optimization, and
other more rigorous methods of optimization, check out [High Performance
Python][hpp].

[guido]: http://neopythonic.blogspot.com/2009/04/tail-recursion-elimination.html
[rubber]: http://www.teamrubber.com/blog/python-tail-optimisation-using-byteplay/
[pyreclimit]: https://docs.python.org/2/library/sys.html#sys.setrecursionlimit
[partial]: http://tomforb.es/adding-tail-call-optimization-to-python
[exceptions]: http://lambda-the-ultimate.org/node/1331
[hpp]: http://shop.oreilly.com/product/0636920028963.do
[opcodes]: http://unpyc.sourceforge.net/Opcodes.html
[decorator]: https://github.com/mynameisfiber/pytailcall/blob/master/pytailcall/internal_loop.py#L77
[pytailcall]: https://github.com/mynameisfiber/pytailcall/
