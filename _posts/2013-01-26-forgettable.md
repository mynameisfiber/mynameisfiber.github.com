---
layout: post
type: blog
title: forget table
tagline: how to responsibly forget data
date: 2013-01-26
categories : [projects, code]
tags : [forgettable, distribution, database, statisticsl, math]
---

_The following is a cross post from the [bitly engineering
blog](http://word.bitly.com/post/41284219720/forget-table):_

> [Forget Table](http://bitly.github.com/forgettable/) is a solution to the problem of
> storing the _recent_ dynamics of [categorical
> distributions](http://en.wikipedia.org/wiki/Categorical_distribution) that
> change over time (ie: non-stationary distributions).

What does this mean? Why is this useful? What makes this the most important
thing since sliced bread?! Read on!

Storing distributions is crucial for doing any sort of statistics on a dataset.
Normally, this problem is as easy as keeping counters of how many times we've
seen certain quantities, but when dealing with data streams that constantly
deliver new data, these simple counters no longer do the job.  They fail
because data we saw weeks ago has the same weight as data we have just seen,
even though the fundamental distribution the data is describing may be
changing.  In addition it provides an engineering challenge since the counters
would strictly grow and very soon use all the resources available to it.  This
is why we created [Forget Table](http://bitly.github.com/forgettable).


### Background

A [categorical
distribution](http://en.wikipedia.org/wiki/Categorical_distribution) describes
the probability of seeing an event occur out of a set of possible events. So an
example of this at bitly is that every click coming through our system comes
from one of a fixed number of country codes ([there are about
260](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)). We would like to
maintain a categorical distribution, that assigns a probability to each
country, that describes how likely any given click comes from each country.
With bitly's data, this is going to give a high weight to the US and lower
weights to Japan and Brazil, for example.

It's very useful for bitly to store distributions like this, as it gives us a
good idea as to what's considered 'normal'. Most of the time we produce
analytics that show, for example, how many clicks came from a given country, or
referrer. While this gives our clients a sense of where there traffic is coming
from, it doesn't directly express how surprising their traffic is.  This can be
remedied by maintaining a distribution over countries for _all_ of bitly, so
that we can identify anomalous traffic, ie: when a particular link is getting
disproportionally more clicks from Oregon than we would normally expect.

The difficulty that Forget Table deals with comes from the fact that what bitly
considers normal changes constantly. At 8am on the East Coast of the US, we'd
be surprised to see a lot of traffic coming from San Francisco (they're all
still asleep over there) however at 11am EST we should expect to see tons of
traffic coming from San Francisco. So unless we allow our understanding of
what's considered normal to change over time, we are going to have a skewed
idea of normality. 

This is a general problem over longer time scales, too. The behavior of the
social web is different in December than it is in July, and it's different in
2012 than it was in 2011. We need to make sure that our understanding of
normality changes with time. One way of achieving this is to forget old data
that's no longer relevant to our current understanding. This is where Forget
Table comes in.


### Why forget in the first place?

The basic problem is that the fundamental distribution (ie: the distribution
that the data is _actually_ being created from) is changing.  This property is
called being "non-stationary".  Simply storing counts to represent your
categorical distribution makes this problem worse because it keeps the same
weight for data seen weeks ago as it does for the data that was just observed.
As a result, the total count method simply shows the combination of every
distribution the data was drawn from (which will approach a Gaussian by the
[central limit theorem](http://en.wikipedia.org/wiki/Central_limit_theorem)).

A naive solution to this would be to simply have multiple categorical
distributions that are in rotation.  Similar to the way log files get rotated,
we would have different distributions that get updated at different time.  This
approach, however, can lead to many problems.

When a distribution first gets rotated in, it has no information about the
current state of the world.  Similarly, at the end of a distribution's rotation
it is just as affected by events from the beginning of it's rotation as it is
by recent events.  This creates artifacts and dynamics in the data which are
only dependent on the time of and time between rotations.  These effects are
similar to various pathologies that come from binning data or by simply keeping
a total count.

On the other hand, forgetting things smoothly using rates we have a continuous
window of time that our distribution is always describing.  The further back in
time the event is, the less of an effect it has on the distribution's current
state.


### Forgetting Data Responsibly

Forget table takes a principled approach to forgetting old data, by defining
the *rate* at which old data should decay. Each bin of a categorical
distribution forgets its counts depending on how many counts it currently has
and a user specified rate.  With this rule, bins that are more dominant get
decayed faster than bins without many counts.  This method also has the benefit
of being a very simple process (one that was inspired by the decay of
radioactive particles) which can be calculated very quickly.  In addition,
since bins with high counts get decayed faster than bins with low counts, this
process helps smooth out sudden spikes in data automatically.

If the data suddenly stopped flowing into the Forget Table, then all the
categorical distributions would eventually decay to the uniform distribution -
each bin would have a count of 1 (at which point we stop decaying), and *z*
would be equal to the number of bins (see a
[visualization](http://bitly.github.com/forgettable/visualization/) of this happening). This
captures the fact that we no longer have any information about the distribution
of the variables in Forget Table.

The result of this approach is that the counts in each bin, in each categorical
distribution, decay exponentially.  Each time we decrement the count in a bin,
we also decrement the normalising constant *z*.  When using ForgetTable, we can
choose a rate at which things should decay, depending on the dominant time
constants of the system.


### Building Categorical Distributions in Redis

We store the categorical distribution as a set of event counts, along with a
'normalising constant' which is simply the number of all the events we've
stored. In the country example, we have ~260 bins, one per country, and in each
bin we store the number of clicks we've seen from each country. Alongside it,
our normalising constant stores the total number of clicks we've seen across
all countries. 

All this lives in a [Redis sorted set](http://redis.io/topics/data-types) where
the key describes the variable which, in this case, would simply be
`bitly_country` and the value would be a categorical distribution. Each element
in the set would be a country and the score of each element would be the number
of clicks from that country. We store a separate element in the set
(traditionally called *z*) that records the total number of clicks stored in
the set. When we want to report the categorical distribution, we extract the
whole sorted set, divide each count by *z*, and report the result. 

Storing the categorical distribution in this way allows us to make very rapid
writes (simply increment the score of two elements of the sorted set) and means
we can store millions of categorical distributions in memory. Storing a large
number of these is important, as we'd often like to know the normal behavior
of a particular key phrase, or the normal behavior of a
[topic](http://rt.ly/#t=economics), or a [bundle](http://bitly.com/bundles/),
and so on. 


### Forgetting Data Under Strenuous Circumstances

This seems simple enough, but we have two problems. The first is that we have
potentially millions of categorical distributions. Bitly maintains information
for over a million separate key phrases at any given time, and (for some super
secret future projects) it is necessary to store a few distributions per
key phrase. So we are unable to iterate through each key of our Redis table
in order to do our decays, so cron-like decays wouldn't be feasible (ie:
decaying every distribution in the database every several minutes).

The second problem is that data is constantly flowing into multiple
distributions: we sometimes see spikes of up to 3 thousand clicks per second
which can correspond to dozens of increments per second.  At this sort of high
volume, there is simply too much contention between the decay process and the
incoming increments to safely do both.

So the real contribution of Forget Table is an approach to forgetting data at
read time. When we are interested in the *current* distribution of a particular
variable, we extract whatever sorted set is stored against that variable's key
and decrement the counts at that time.

It turns out that, using the simple rate based model of decay from above, we can
decrement each bin by simply sampling an integer from a [Poisson
distribution](http://en.wikipedia.org/wiki/Poisson_distribution) whose rate is
proportional to the current count of the bin and the length of time it has been
since we last decayed that bin. So, by storing another piece of information,
the time since we last successfully decayed this distribution, we can calculate
the amount of counts to discard very cheaply (this algorithm is an
approximation to [Gillespie's
algorithm](http://en.wikipedia.org/wiki/Gillespie_algorithm) used to simulate
stochastic systems).

In Redis we implement this using pipelines. Using a pipeline, we read the
sorted set, form the distribution, calculate the amount of decay for each bin
and then attempt to perform the decay. Assuming nothing's written into the
sorted set in that time, we decay each bin and update the time since last
decayed. If the pipeline has detected a collision -- either another process has
decayed the set or a new event has arrived -- we abandon the update. The
algorithm we've chosen means that it's not terribly important to actually store
the decayed version of the distribution, so long as we know the time between
the read and the last decay.


### Get the Code and We're Hiring!

The result is a wrapper on top of Redis that runs as a little HTTP service. Its
API has an increment handler on `/incr` used for incrementing counts based on
new events, and a get handler on `/get` used for retrieving a distribution.  In
addition, there is an `/nmostprobable` endpoint that returns the n categories
which have the highest probability of occurring.

There are two versions, one in Go (for super speed) and the other in Python.
The code is open source and up on Github, available at
[http://bitly.github.com/forgettable](http://bitly.github.com/forgettable).

As always, if you like what you see (or feel the need to make improvements),
don't forget that [bitly is hiring!](https://bitly.com/pages/jobs).

Get ready for more posts on science at bitly, and If you have any specific
questions, feel free to ping me on twitter
[@mynameisfiber](http://twitter.com/mynameisfiber/).

<div class="postmeta"> by <a href="http://micha.gd/">micha gorelick</a></div>
