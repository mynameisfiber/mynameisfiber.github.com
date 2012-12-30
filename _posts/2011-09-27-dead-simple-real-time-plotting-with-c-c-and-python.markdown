---
layout: post
title: Dead Simple Real Time Plotting with C/C++ and Python
tagline: plotting in a pinch
date: 2011-09-27
category : code
tags : [code, python, plot, C, hack, tutorial]
---

## Concepts
* Standard [input](http://en.wikipedia.org/wiki/Standard_streams#Standard_input_.28stdin.29)/[output](http://en.wikipedia.org/wiki/Standard_streams#Standard_output_.28stdout.29) (Think: the input and output of your program)
* [Unix Pipes](http://en.wikipedia.org/wiki/Pipeline_(Unix))
* [Plotting in matplotlib](http://lmgtfy.com/?q=pylab+tutorial)

## The Hack 
So, you have your code working, but you are tired of having
to run a separate program to see plots? There are many simple
solutions, but I am going to present what I think is the
absolute simplest. What we are going to do is have your C/C++
program output the data and have python capture it and save
plots in real-time! What does this entail? Well...

* Your C/C++ program no longer writes to a file (using
  fprintf), but rather writes to the standard output (STDIN,
  using simply printf)

* Your python script will now read data straight from STDIN
  using raw_input()

* You will have to use a unix shell to sew all of this
  together

Let's look at a very simple example. Suppose we have a very
important C program that outputs some very important numbers.
In order for it to work with this new standard, we have it
output the data to screen. Namely, it does:

{% highlight c linenos %}
// FILENAME: makedata.c
#include <stdio.h>
#include <math.h>
 
#define PI 3.14159
 
int main()
{ 
  int i,j;
  for(j=0; j<10; j++) {
    for(i=0; i<20; i++) {
      printf("%f\t",sinf(i * PI / 10.0 + j*PI/10));
    }
    printf("\n");
  }
 
  return 0;
}
{% endhighlight %}

Now, when we run this, we get a bunch of numbers thrown to
screen!

{% highlight bash linenos %}
$ gcc -lm -o makedata makedata.c
$ ./makedata
0.000000 0.309017 0.587785 0.809017 0.951056 1.000000 0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 
0.309017 0.587785 0.809017 0.951056 1.000000 0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 
0.587785 0.809017 0.951056 1.000000 0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 
0.809017 0.951056 1.000000 0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 
0.951056 1.000000 0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 0.809013 
1.000000 0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 0.809013 0.951055 
0.951057 0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 0.809013 0.951055 1.000000 
0.809018 0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 0.809013 0.951055 1.000000 0.951059 
0.587787 0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 0.809013 0.951055 1.000000 0.951059 0.809021 
0.309019 0.000003 -0.309014 -0.587783 -0.809015 -0.951055 -1.000000 -0.951058 -0.809020 -0.587789 -0.309022 -0.000005 0.309012 0.587781 0.809013 0.951055 1.000000 0.951059 0.809021 0.587792 
{% endhighlight %}

In order to capture the data in python, we must use the
raw_input() function. This function simply gets input from the
user and puts it into a variable. It puts everything the user
types up to when they press enter. This is why the C code is
that it only prints a newline (ie: '\n') once one full line of
data has been outputted to screen. If we had put a newline in
the first printf statement, the python plotting program would
only plot one number at a time! So, you can think of the tab
(\t) as deliniating between values and the newline (\n)
deliniating between different sets of data. The python code
that reads this data looks like:

{% highlight python linenos %}
# FILENAME: plot.py
import numpy as np
import pylab as py
 
def plot_data(data):
  py.clf()
  py.plot(data)
  py.show()
  py.savefig("data-%.8d.png"%counter)
 
if __name__ == "__main__":
  counter = 0
  while True:
    try:
      tmp = raw_input().strip().split()
      data = np.array(tmp, dtype=np.double)
    except EOFError:
      print "Input has terminated! Exiting"
      exit()
    except ValueError:
      print "Invalid input, skipping.  Input was: %s"%tmp
      continue
 
    print "Plotting plot number %d"%counter
    plot_data(data)
    counter += 1
{% endhighlight %}

You can test this program by running it, typing a bunch of
numbers separated by a space, then pressing enter. It will plot
it, display it and save it! Then, the program will ask you
again for more numbers. To exit, you type Control-D which makes
the EOFError happen.

What is going on in this program is quite simple. First,
"tmp" gets the long string of characters that you typed in.
However, python doesn\'t know it contains numbers, it just looks
like a bunch of random characters! Now, we use numpy and tell
it to create an array out of the data. The "dtype=np.double" is
us telling numpy that we are realing with valid numbers. A
ValueError happens if we weren't good on our promise and the
input isn't in fact all numbers.

Now for the most important part... how do we put these two
things together? Unix has a very cool thing called input/output
redirection. This allows us to redirect the output of one
program to the input of another. So, instead of us having to
type in the numbers for the python script, we can have the
C/C++ program type it for us! The syntax is quite simple, all
you have to do is:

{% highlight bash linenos %}
$ ./makedata | python plot.py
{% endhighlight %}

And now you are done! You should have a bunch of plots
coming up of sin waves with various phases. Congrats!

There is one more thing you can do to make your plots even
more fancy. Sometimes, you don't want to save each figure or
have to click through to see every plot, one at a time.
Instead, you just want to see an animation of what is happening
as it is happening! Or, you are already making an animation
with many py.plot() statements, and you want it to be smoother
and faster! To do this, you can to look into pylab animations.
The people at scipy have a great [tutorial](http://www.scipy.org/Cookbook/Matplotlib/Animations)
on this issue. You can also look at a 
[small plotting script](https://github.com/mynameisfiber/waveequation/blob/master/fortran/test-waveequation.py)
I made which does something very similar.

The basics of this method involve: creating your plots at
the beginning of your script, and saving them into variables.
Then, when you get new data that you want to plot, you simply
change the data in the plot with .set_data(). One thing to note
is the line "py.ion()" right after I imported pylab and how I
use py.draw() instead of py.show(). If you want to get started
playing around with this, simply take the same code from
earlier in this document, add "py.ion()" after we import pylab,
delete the py.savefig() line and replace py.show() with
py.draw()! This will give you a (quite slow) animation.
