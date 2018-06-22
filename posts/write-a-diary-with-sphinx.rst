.. title: Write a Diary with Sphinx
.. slug: writing-a-diary-using-sphinx
.. date: 2018-06-22 13:49:54 UTC+08:00
.. tags: sphinx, reST, python, hacking
.. category: coding
.. link:
.. description:
.. type: text
.. location: Palo Alto

My favorite lightweight markup language is reStructuredText [#]_. Unlike XML/HTML, a *lightweight* markup language is more human-readable, while it still preserves some basic abilities of expressing hyper-text content. This article (and also the blog) is written in reStructuredText. Though not as famous as Markdown [#]_, reStructuredText, in my opinion, is more feature-rich and extensible. The official Python document [#]_ is written in it, with the help of Sphinx [#]_, the documentation generator, powered by the lower-level reST engine, docutils [#]_.

Usually documentation generators are used by code projects to generate accompanied references and tutorials. However, thanks to the versatility of Sphinx, we can also keep our personal diaries with it! Here I'm gonna show how one can keep multiple diaries at the same time via a single Sphinx project.

Quickstart
----------

First thing to do is to make sure sphinx is installed on your machine. In Archlinux, it is simply:

.. ccode:: bash

    sudo pacman -S python-sphinx

Then we can make use of the quick start tool to create a template documentation project:

.. ccode:: bash
    
    sphinx-quickstart diaries

This will start a wizard which asks several questions about the preference of your project. Suppose you mostly follow the default settings, the project directory ``diaries/`` will end up like this:

::
    
    >> cd diaries/
    ** 02:28:50 /t/diaries ymf@Pixelbook **
    >> ls -l
    total 16
    drwxr-xr-x 2 ymf ymf   40 Jun 22 02:28 _build
    -rw-r--r-- 1 ymf ymf 4723 Jun 22 02:28 conf.py
    -rw-r--r-- 1 ymf ymf  449 Jun 22 02:28 index.rst
    -rw-r--r-- 1 ymf ymf  607 Jun 22 02:28 Makefile
    drwxr-xr-x 2 ymf ymf   40 Jun 22 02:28 _static
    drwxr-xr-x 2 ymf ymf   40 Jun 22 02:28 _templates

Here, we can include our reST files in ``index.rst``, each keeps track of one diary. In ``index.rst``:

.. ccode:: rst
   :number-lines: 1

   My Memories
   ===========
   
   .. toctree::
      :maxdepth: 2
   
      life
      research
   
   
   Indices and tables
   ==================
   
   * :ref:`genindex`
   * :ref:`modindex`
   * :ref:`search`

As you might have guessed, we should accordingly add two reST files ``life.rst`` and ``research.rst`` to our project directory. In ``life.rst``:

.. ccode:: rst
   :number-lines: 1

   My Life
   =======
   
   Day 1
   -----
   I met a nice girl. Her name is Daisy.
   
   Day 2
   -----
   We had dinner together and went to a movie.
   
   Day 3
   -----
   I showed my love to her because I could't resist myself. She smiled and replied, "You're such a nice guy, but...it's not working out."
   
   Day 4
   -----
   Sad and depressed, I choose to die. This is my last diary.

In ``research.rst``:

.. ccode:: rst
   :number-lines: 1

   The Road of PhD
   ===============
   
   Day 1
   -----
   I got the offer!
   
   Day 2
   -----
   The first day in the lab is great. :)
   
   Day 3
   -----
   Still don't have a paper.
   
   Day ∞
   -----
   Still don't have a paper...

Finally, try to build your diaries:

.. ccode:: bash

   make html

This command shall generate HTML output to ``_build/html`` directory. Open the browser to see the compiled diaries:

.. simpic:: /images/sphinx-diary-1.png
   :class: align-center

The link of "My Life" leads to the diary content:

.. simpic:: /images/sphinx-diary-2.png
   :class: align-center

Hacking
-------

So far so good. The idea of using sections as diary entries is not bad because there won't be too many entries for a browser to handle: imagine you write 10 entries per day, and do it for 100 years, the total number of sections will only be 365,000, which can be easily rendered by modern browsers (I suppose). Scalability won't be a real issue if only for diary purpose. If it will, just partition your diaries into multiple files, according to years, for example.

However, the inconvenience of keeping diaries this way is about the order of sections. One tends to append new writing at the end of the reST file instead of prepending it to the beginning. However, docutils will render the sections according to their order of appearance in reST, which makes sense for an article with only few sections, but not quite so for a diary that "misuses" sections. Naturally, we'd like to see our latest entry at the top of the page instead of scrolling all the way to the end of the page to see it. Luckily, there is a way of reordering the sections both in text and in the table of contents. Add the following code to the end of your ``conf.py``:

.. ccode:: python
   :number-lines: 1

   # reverse the order of sections

   reversed = {"life", "research"}
   
   def reverse_sections(app, doctree, docname):
       if docname in reversed:
           for node in doctree.traverse():
               if node.tagname == "document":
                   l = node[0]
                   children = []
                   while len(l) > 1:
                       children.append(l.pop())
                   for c in children: l.append(c)
   
   def reverse_tocs(app, env):
       for docname in reversed:
           l = env.tocs[docname][0][1]
           l.children.reverse()
   
   def setup(app):
       app.connect("doctree-resolved", reverse_sections)
       app.connect("env-updated", reverse_tocs)

The sections are reversed as expected with the hack:

.. simpic:: /images/sphinx-diary-3.png
   :class: align-center

.. [#] http://docutils.sourceforge.net/rst.html
.. [#] https://daringfireball.net/projects/markdown/
.. [#] https://docs.python.org/3/
.. [#] http://www.sphinx-doc.org/en/master/
.. [#] http://docutils.sourceforge.net/
