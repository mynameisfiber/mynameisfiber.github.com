---
layout: default
title: micha.gd
tagline: all micha all the time
---

<section id="about">
    <div class="section-right offset">
        <p class="bio">
            I'm a former NYU physics/astronomy grad student and current 
            data science engineer at <a href="//bit.ly">bitly</a>. I 
            spend my days moving data at light speed and my nights 
            crusading against bad code.  I also like building and coffee.
        </p>
    </div>
</section>


<section id="projects">
    <div class="section-title">
        <h2>code <small>&mdash; the things that have been keeping me busy on the computer</small></h2>
    </div>
    <div class="section-body">
        <ul>
            <li class="project">
                <span class="project-name">
                    <a href="http://github.com/mynameisfiber/gocountme/">go count me</a>
                </span>
                <span class="project-desc">
                    a leveldb backed k-min values database to store and compare large sets
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="http://github.com/mynameisfiber/countmemaybe/">count me maybe</a>
                </span>
                <span class="project-desc">
                    python explorations of probabilistic distinct value estimation and hash entropy
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="http://bitly.github.com/forgettable/">forget table</a>
                </span>
                <span class="project-desc">
                    a sweet redis based database that stores categorical distributions and forgets data smartly.
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="https://github.com/mynameisfiber/cider-go">cider-go</a>
                </span>
                <span class="project-desc">
                    use any redis client to talk to a cluster of redis servers with redundant shards for great win.
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="http://dev.bitly.com/story_api.html">bitly story api</a>
                </span>
                <span class="project-desc">
                    want to know what going on with a set of urls? this is thing for you!
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="http://rt.ly/">bitly realtime</a>
                </span>
                <span class="project-desc">
                    bad ass math and databases showing you what's happening on the internet.
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="/realtimestream">realtime streams</a>
                </span>
                <span class="project-desc">
                    learn about real time stream processing with bitly's <a href="http://github.com/bitly/simplehttp">simplehttp</a> suite. do it.
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="https://github.com/mynameisfiber/Shell-Config">shell-config</a>
                </span>
                <span class="project-desc">
                    need awesome bash/zsh/vim/screen configurations? look no further!
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="https://github.com/mynameisfiber/seamresize">seamresize</a>
                </span>
                <span class="project-desc">
                    resize things smartly. toy project but still awesome.
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="http://astro.physics.nyu.edu/~mjg490/">academic page</a>
                </span>
                <span class="project-desc">
                    my old site from grad school... chock full of fun code in what I thought was a website.
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="https://github.com/mynameisfiber/Outflow-Driven-Turbulence">outflow-driven turbulence</a>
                </span>
                <span class="project-desc">
                    massively parallel code to see how new stars stir turbulence. read the <a href="https://github.com/mynameisfiber/Outflow-Driven-Turbulence/raw/master/doc/Writeup.pdf">paper</a>!
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="https://github.com/mynameisfiber/Misc-Old-Projects">misc code</a>
                </span>
                <span class="project-desc">
                    a github repo of some stuff I made before embracing git... enjoy!
                </span>
            </li>
            <li class="project">
                <span class="project-name">
                    <a href="https://github.com/mynameisfiber/">other stuff!</a>
                </span>
                <span class="project-desc">
                    venture into my github page and see what else there is.
                </span>
            </li>
        </ul>
    </div>
</section>

<section id="blog">
    <div class="section-title">
        <h2>blog <small>&mdash; full writeups on awesome projects</small></h2> 
    </div>
    <div class="section-body">
        <ul class="post-list">
            {% for post in site.posts %}
                {% if post.type == "blog" %}
                <li class="blog-entry">
                    <span class="blog-date">
                        {{ post.date | date: "%B %e, %Y" }}
                    </span>
                    <span class="blog-desc">
                        <a href="{{ BASE_PATH }}{{ post.url }}" class="blog-title">{{ post.title }}</a>{% if post.tagline %} &mdash; {{ post.tagline }} {% endif %}
                    </span>
                </li>
                {% endif %}
            {% endfor %} 
        </ul>
    </div>
</section>

<section id="blerb">
    <div class="section-title">
        <h2>blerb <small>&mdash; short and sweet... mainly galleries or quick how-to's</small></h2>
    </div>
    <div class="section-body">
        <ul class="post-list">
            {% for post in site.posts %}
                {% if post.type == "blerb" %}
                <li class="blog-entry">
                    <span class="blog-date">
                        {{ post.date | date: "%B %e, %Y" }}
                    </span>
                    <span class="blog-desc">
                        <a href="{{ BASE_PATH }}{{ post.url }}" class="blog-title">{{ post.title }}</a>{% if post.tagline %} &mdash; {{ post.tagline }} {% endif %}
                    </span>
                </li>
                {% endif %}
            {% endfor %} 
        </ul>
    </div>
</section>

