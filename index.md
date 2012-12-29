---
layout: page
title: micha.gd
tagline: all micha all the time
---
{% include JB/setup %}

<center>
<img src="http://www.gravatar.com/avatar/df8d7dd89dc8eb1c9297355d86ec5c25.png?s=200" alt="Hi! I'm Micha">
<br>
<h2>I'm Micha.  I like programming, space, science and hot chocolates.</h2>
</center>

# Github Projects
* [forget table](http://micha.gd/forgettable/): a sweet redis based database that stores categorical distributions and forgets data smartly.
* [cider-go](https://github.com/mynameisfiber/cider-go): redis proxy that allows you to use any redis client you want to talk to a cluster of redis servers with backup shards for great win.
* [shell-config](https://github.com/mynameisfiber/Shell-Config): need awesome bash/zsh/vim/screen configurations? look no further!
* [realtime streams](http://micha.gd/realtimestream/): learn about real time stream processing with bitly's [simplehttp](http://github.com/bitly/simplehttp) suite. do it.
* [seamresize](https://github.com/mynameisfiber/seamresize): resize things smartly. toy project but still awesome.
* [other stuff!](https://github.com/mynameisfiber/): venture into my github page and see what else there is

# Blog Posts
<ul class="posts">
  {% for post in site.posts %}
    <li>[<code>{{ post.date | date: "%Y/%m/%d" }}</code>]<a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>{% if post.tagline %}: {{ post.tagline }} {% endif %}</li>
  {% endfor %}
</ul>
