.. title: A Brief Intro to Input Method Framework, Linux IME, and XIM
.. slug: a-brief-intro-to-linux-input-method-framework
.. date: 2017-06-27 23:06:43 UTC+08:00
.. tags: IME, CJK, linux, xim, X11
.. category: coding
.. link:
.. description:
.. type: text
.. location: Ithaca

There are chances one need an input method editor (IME). For CJK users,
supporting unicode and wide characters from Chinese, Japanese and Korean is not
enough, since it only gives the display of their native languages, not the way
of input. Western people, especially who can manage to type their
characters and words directly from a standard keyboard, may not understand the
need for such input facility, which could possibly be the reason why CJK
support is usually added as an additional feature in the end of a software
system.

Briefly speaking, imagine the case where English has more than 26 alphabets,
far more than that, what would happen? Imagine a language with tens of
thousands of basic alphabets (characters, or typographically, glyphs). How
would you design the input stack of a computer system to let users input
efficiently? Since we cannot introduce a "super" keyboard having thousands of
keys, a better way is to try to "spell" each character by making a series of
key strokes. So, inaccurately, if you do this in English, it is like you spend some
time pressing the keys to get an "a" in the end. Or press more than five keys
(probably 15 keys or more) to have "linux" shown up in your text editing
software. This way, we only incur logarithmic time complexity to index a
character in CJK space (thinking about looking up a word in an English
dictionary by tracing the leading letters). Another good news
is, using very basic statistical methods or advanced NLP effort, such way of
making input can be fairly efficient in spite of multiple candidates given the
same key press combination. The ambiguity comes from the fact that, many
mainstream input methods of Asian languages use English alphabets (some
language, such as Japanese, calls it "Romaji", related to old Romanian
alphabets) to represent the pronunciation of a character. It is likely that, in
some languages, for example Chinese, to have different characters or words
spelled with the same sequence of alphabets. For example, both 「元音」("vowel")
and 「原因」("reason") are spelled by "yuan yin" in pinyin scheme, the
pronunciation notation standardized by government of China (mainland). Another
scheme, zhuyin (or Mandarin Phonetic Symbols), advocated by Taiwan, is also
used for users in that area.

.. TEASER_END

The reader may have noticed the potential diversity of such input schemes or
their implementations, input method editors (IMEs). So it is inevitable that an
operating system, or a desktop environment needs to provide with a framework to
support various kinds of IMEs. Unfortunately, the current situation of IME
support in Linux is still a mess, according to my opinion, which will
be introduced later. The reason for such a complicated scenario might be due to
the fact that early stage of developing such software systems was done by
mostly people who speak a language which can be typed without an IME. English
was probably also the primary focus of language support during the development.
So even if many devs from other non-latin based countries joined, they still
used English to communicate, and there lacked some consensus of making a general
framework to support their own languages. But just a wild guess by myself.

In Linux, currently there are three major ways to get IME support from graphical
interface: X Input Method (XIM), GTK IM module or QT IM module. These are three
general IME frameworks which allow any IME implementation conforming to the given
API. However, there are also some other applications claimed to be "input
method framework", such fcitx and ibus. But in order to use either one, you are
supposed to enable XIM or GTK/QT IM support for it. The confusion begins from here.
There is no known article or documentation clarifies the different roles of an
input software in this messy software stack. Usually people mix the concept of
an IME framework with IME implementation that relies on such framework.
My opinion is to regard fcitx/ibus as a secondary framework which behaves
like a normal single IME to the old IME framework (XIM, QTK IM, QT IM) but
offers the interface to support a bunch of actual input method implementations
(rime, pinyin, anthy, etc). So they are like a transparent layer for current
typical use, in the messy world of IME. I really wish there would be a general
and canonical basic framework to unify IMEs and remove the unnecessarily layered
and entangled implementation.

The rest of this blog post will introduce the basics of using XIM, a very old
input method native to X11 (the spec is copyrighted 1993, 1994). Although some
people think it is obsolete, there is no known convincing reason for not using
it. As an IME framework, it provides with a pretty general interface to deal
with various kinds of IME in a simple way (the core APIs are just a few). The
only reason to abandon it and create another is the internal protocol is
somehow convoluted. Taking the filter event as an example, the original
specification is confusing, and not supposed to be that difficult. It is also
obvious that the authors did not predict the typical usage of IME framework
precisely at the time of building it, so there are some unnecessary freedom
that nobody will likely get benefit from, and in the end, making it difficult
to understand the internals. So with that being said, XIM might be convenient
for application (text editors, terminals) devs, but painful for IME builders.
Nevertheless, XIM is still very useful if you want to develop a pure X11
program without GTK/QT in your pocket, or deliberately do so. Since fcitx and
ibus have decent legacy support for XIM, it is so far the best way to go for
your X11 program.

XIM has two different architectures, front-end and back-end [#]_:

- In front-end architecture, xlib will deliver key events to both the
  application and the IME, which means special care should be taken in order to
  synchronize them. But such asynchrony is good for interactive performance.

- As for back-end architecture, the IME will behave like a filter which first
  takes in the user's input, updates its state, composes some characters, and
  possibly passes some events over to the application key event handler. Since the
  application is handling events logically "behind" the IME, it is called "back-end".

According to the documentation, XIM supports back-end mode by default, and front-end
mode can be enabled by some extension. The following tutorial gives a minimal
working example of supporting IME in back-end mode (works with fcitx as tested).

First of all, XIM requires setting locale correctly before you initiate an XIM
object which is the abstraction of the underlying IME in use. The following
lines give an example of correctly setting up the locale and locale modifier.
You can call ``setlocale`` to set the ``LC_CTYPE`` or ``LC_ALL`` to an empty
string so it will default to the locale in the current environment variables,
which is a good behavior assuming the system environment is properly set up.
By making another call ``XSetLocaleModifiers``, you will set the modifier to
the existing locale, which is usually necessary since X is often not able
to locate your IME binary according to your locale (at least for fcitx) by default. As a
common practice, whenever you install fcitx or ibus, the manual will suggest
you to add the line ``export XMODIFIERS="@im=fcitx"`` to your profile. The
function called with empty string will also extract that from ``$XMODIFIERS`` [#]_.

.. ccode:: c
   :number-lines: 20

   int main() {
       /* fallback to LC_CTYPE in env */
       setlocale(LC_CTYPE, "");
       /* implementation-dependent behavior, on my machine it defaults to
        * XMODIFIERS in env */
       XSetLocaleModifiers("");

You can, of course, as a test, hard code your settings into the strings:

.. ccode:: c
   :number-lines: 20

   int main() {
       setlocale(LC_CTYPE, "zh_CN.utf8");
       XSetLocaleModifiers("@im=fcitx");

And let's create some global variables and initialize a simple window:

.. ccode:: c
   :number-lines: 1

   #include <X11/Xlib.h>
   #include <X11/Xutil.h>
   #include <X11/Xos.h>
   #include <stdlib.h>
   #include <stdio.h>
   #include <locale.h>
   #include <assert.h>
   
   Display *dpy;
   Window win;
   int scr;

.. ccode:: c
   :number-lines: 26

       /* inside main, after XSetLocaleModifiers */
       /* setting up a simple window */
       dpy = XOpenDisplay(NULL);
       scr = DefaultScreen(dpy);
       win = XCreateSimpleWindow(dpy,
               XDefaultRootWindow(dpy),
               0, 0, 100, 100, 5,
               BlackPixel(dpy, scr),
               BlackPixel(dpy, scr));
       XMapWindow(dpy, win);

Then we initialize an XIM object which serves as a handle to a chosen IME
(based on our previous environmental settings), and also a XIM Context object
(XIC) for managing the state and context for the text input. The reason of
having two different kinds of objects is because there could be multiple text
input contexts in a complex application: think about a word processor which has
text boxes for editing attributes of the document and also the large editing
area for inserting the main text. XIM models this by two general concepts XIM
and XIC. An XIM Context is logical, and coressponds to a single XIM object which
is the IME used for editing in the context. This means one can attach the same
IME to all different contexts, or use different IMEs for some. It's hard to
imagine a user using two different IMEs at the same time within one
application, but having an abstract of XIC is fruitful because an IME can
maintain a different state per context, to offer a consistent
experience.

But usually users do not have such sophisticated need, we can just create one
single XIC attached to a single XIM, and use XIC for all inputs:

.. ccode:: c
   :number-lines: 37

        /* initialize IM and IC */
        XIM xim = XOpenIM(dpy, NULL, NULL, NULL);
        XIC ic = XCreateIC(xim,
                            /* the following are in attr, val format, terminated by NULL */
                            XNInputStyle, XIMPreeditNothing | XIMStatusNothing,
                            XNClientWindow, win,
                            NULL);
        /* focus on the only IC */
        XSetICFocus(ic);
        /* capture the input */
        XSelectInput(dpy, win, KeyPressMask);

Almost there, but need one more important thing. If you start the event loop
and try to capture the output from IME using ``Xutf8LookupString``, you will
find you can't even toggle the IME (by pressing ctrl-space for fcitx). This is
because although you've set up everything needed, there is no logic of fowarding
events to the IME. You may think, well, since it is in back-end architecture
by default, X11 will first forward the events to IME and then let them handled
by my handler. It is partially correct. In fact, you need to manually forward
your event to the IME by calling ``XFilterEvent``. The function will foward
your current to-be-deilivered event to the IME and return true if the IME has
consumed it, or false when it passes it over to your logic. Here, what's
happening behind the scene is you will continue to the next loop without
handling the key press at first, and then, depending on the state of IME, it
will send back the key press as a new event to X11 and return false when you
call ``XFilterEvent`` function on that. This twisted control flow makes up a logical
back-end implementation [#]_.

.. ccode:: c
   :number-lines: 53

       static char *buff;
       size_t buff_size = 16;
       buff = (char *)malloc(buff_size);
       for (;;)
       {
           KeySym ksym;
           Status status;
           XEvent ev;
           XNextEvent(dpy, &ev);
           if (XFilterEvent(&ev, None))
               continue;
           if (ev.type == KeyPress)
           {
               size_t c = Xutf8LookupString(ic, &ev.xkey,
                                           buff, buff_size - 1,
                                           &ksym, &status);
               if (status == XBufferOverflow)
               {
                   printf("reallocate to the size of: %lu\n", c + 1);
                   buff = realloc(buff, c + 1);
                   c = Xutf8LookupString(ic, &ev.xkey,
                                       buff, c,
                                       &ksym, &status);
               }
               if (c)
               {
                   spot.x += 20;
                   spot.y += 20;
                   send_spot(ic, spot);
                   buff[c] = 0;
                   printf("delievered string: %s\n", buff);
               }
           }
       }
   }

``Xutf8LookupString`` will pull the composed string from IME or the character
of the pressed key passed through IME. Notice that you have to specify the
length of the byte buffer. The example above uses a very small initial buffer
which limits the capacity to only deilivering around five Chinese characters in
one composition. Each utf-8 character takes around 3 bytes. Remember, it is
quite usual for users to keep making key press until a phrase of several
characters is formed. Only then will the composed string be deilivered to your
application. In rxvt-unicode, it is set to 512, a very reasonable size, or you
could use ``realloc`` in the example to dynamically expand the buffer.

The last thing is many IMEs (at least Chinese IMEs) allow users to preview and
select the correct character/phrase candidates from an interactive box floating
near the input cursor. The input cursor is application-dependent, so you might
be interested in positioning  it to the right place. To position the IME
editing GUI to a place, you should use ``XSetICValues`` to send the new spot to an XIC.
Therefore, here comes the last missing piece:

.. ccode:: c
   :number-lines: 13

   void send_spot(XIC ic, XPoint nspot) {
       XVaNestedList preedit_attr;
       preedit_attr = XVaCreateNestedList(0, XNSpotLocation, &nspot, NULL);
       XSetICValues(ic, XNPreeditAttributes, preedit_attr, NULL);
       XFree(preedit_attr);
   }

.. ccode:: c
   :number-lines: 48

   XPoint spot;
   spot.x = 0;
   spot.y = 0;
   send_spot(ic, spot);

Run the program with some key strokes and IME input (`full code <https://gist.github.com/Determinant/19bbecb6db35312861f6cf9f54fdd3a5>`_):

::

    gcc -o xim_example xim_example.c -lX11
    ./xim_example
    delievered string: t
    delievered string: e
    delievered string: s
    delievered string: t
    delievered string: 測試
    delievered string: 測試中文
    reallocate to the size of: 22
    delievered string: 測試中文輸入法
    delievered string: 測試


.. [#] https://www.x.org/releases/X11R7.7/doc/libX11/libX11/libX11.html#Input_Method_Overview
.. [#] Actually, the behavior is implementation-dependent, but on my machine, it defaults to ``$XMODIFIERS``.
.. [#] https://www.x.org/releases/X11R7.6/doc/libX11/specs/XIM/xim.html#filtering_events
