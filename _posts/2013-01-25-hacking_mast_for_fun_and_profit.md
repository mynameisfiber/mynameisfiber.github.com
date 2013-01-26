---
layout: post
type: blog
title: Hacking MAST for fun and profit
tagline: what astronomy has to learn from industry
date: 2013-01-25
categories : [projects, code]
tags : [astronomy, hackday, SQL injection, strict schema]
---

> I was recently involved in an [astronomy
> hackathon](http://www.space.com/19150-astronomy-hack-day.html) that was great
> fun!  One of my projects for the day was to hack into
> [MAST](http://archive.stsci.edu/), which is a giant astronomical database.  The
> hack was successful and, by the end of the day, we had found a valid SQL
> injection into the system which allowed us to manipulate data, or worse.  Below
> is a short writeup of what I did and why it is important for future science
> developers to keep in mind.

## Project in a nutshell

MAST is a database which holds data on many catalogues of objects we find in
the sky.  It is helpful because it lets astronomers query this database in
order to find out what we know about a certain region of space.  In order to
query the database, we need to form a query string.  This can be something as
simple as "SELECT object_name, object_luminosity WHERE
object_coordinates=\[15,24\]", however in reality they become very complicated.
As a result of these queries getting very complicated, MAST has set up
something called an API which allows us to create very complicated queries
quite easily.  With this API, we simply need to input certain parameters and
it'll form the correct query for us.  For example, in the previous example we
could access the "object luminosity" API with the parameters "15, 24" and it'll
perform the previous query for us.

Unfortunately, when the MAST API wasn't doing sanity checks -- it wasn't
verifying that the coordinates, for example, we were sending were in fact
coordinates!  So, instead of sending "\[15, 24\]" as the coordinates and getting
the query we expected, we could send something like "\[15, 24\]; DELETE THE
DATABASE", which would get interpreted into the query "SELECT object_name,
object_luminosity WHERE object_coordinates=\[15,24\]; DELETE THE DATABASE".  As a
result, the API would let any outsider run any arbitrary code they wanted,
letting them do anything from changing data in the database to deleting the
whole thing!

This type of exploit is called an [SQL
injection](http://en.wikipedia.org/wiki/SQL_injection) and they have haunted
the internet for quite some time now!


## Why is this important?

There has been a movement in astronomy to adopting web 2.0 philosophies with
having open API's for quite a while now.  The only problem is that most of this
movement has been done quite blindly... it seems that a lot of the lessons that
have been learned in industry regarding these same problems have yet to be
learned by academia.  This is where my project fit in: by compromising MAST I
highlighted several problems, which are common problems with open API's, that
weren't properly addressed in their API.

The first problem is a basic security problem.  The internet is a very open
place and there are bound to be people who want to bring chaos to whatever
system you put in front of them.  This problem is particularly important for
open science since data can easily be changed and manipulated in a way that
would severely hamper any science done on that dataset.  In fact, with the
exploit I found we were successfully able to change the classification of an
object!  This, of course, can have very dire consequences.

The reason this security hole was uncovered, in my opinion, is because of a
second problem: the lack of a strict data schema.  Many of the databases you
find in astronomy as made to be very general and be able to hold all sorts of
data.  This is great until the database grows to be so big that nobody knows
what it stores anymore.  As a result, many of the API's accessing this data
become lax and don't enforce a certain type of input -- although a certain
field _should_ be an integer, the API doesn't know that and will pass whatever
you give it to the database (which was the brunt of the exploit).  By
explicitly stating what inputs you take, what type they are and what they mean,
you not only help people using your API but you can also enforce stricter
sanity checks which in turn helps security.

I really love the movement that astronomy has been making towards open data and
open API's, but I think that if they don't learn from the two points I've
outlined then things are doomed.  If they don't learn about security then the
databases will be compromised and used for evil.  If they don't learn about
making clear your inputs and outputs (both to user and to the computer), then
these API's will quickly become unusable (as we've seen in the past with the
many attempts at "the one and only ____ you'll need to do astronomy").
