---
layout: post
type: blerb
title: hadoop &lt; *
tagline: how not to design a system
date: 2013-01-14
categories : [code]
tags : [code, fail, aggravating]
album_username : mynameisfiber
album_id : 5827960964525714753
---

While trying to figure out how to move files to HDSF through an SSH tunnel, I encountered this gem:

    $ hadoop --help
    Error: No command named `--help' was found. Perhaps you meant `hadoop -help'
    
    $ hadoop -help
    Error: No command named `-help' was found. Perhaps you meant `hadoop help'
    
    $ hadoop help
    Exception in thread "main" java.lang.NoClassDefFoundError: help
    Caused by: java.lang.ClassNotFoundException: help
            at java.net.URLClassLoader$1.run(URLClassLoader.java:217)
            at java.security.AccessController.doPrivileged(Native Method)
            at java.net.URLClassLoader.findClass(URLClassLoader.java:205)
            at java.lang.ClassLoader.loadClass(ClassLoader.java:321)
            at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:294)
            at java.lang.ClassLoader.loadClass(ClassLoader.java:266)
    Could not find the main class: help. Program will exit.
