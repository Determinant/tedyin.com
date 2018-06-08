.. title: Archlinux on Pixelbook
.. slug: archlinux-on-pixelbook
.. date: 2018-05-13 11:19:26 UTC+08:00
.. tags: hacking
.. category: life
.. link:
.. description:
.. type: text
.. location: Ithaca

It's been a while since I last paid attention to the laptop market. With a
little disappointment, the hardware spec hasn't been improved as much as I
expected. Ultrabooks are still mostly shipped with two typical combinations: 8G RAM
with i5 or 16G RAM with i7. I don't need i7 because I weigh
portability over performance. I have my nice Linux desktop for performance
demanded tasks and I would like to have a skinny laptop that is
friendly to both surfing and coding. Moreover, I've been waiting for a "dream" machine
that can properly serve both as a laptop and a tablet. Pixelbook seems just right.

I got one with 8G RAM, i5 CPU, and 128G SSD at $880 during a sale. The hardware
is worth the price, considering the decent spec given 2.4lb weight, and I
also personally like the look that won't let any haxor down. It operates with the heavily
shielded Chrome OS. After some search I realize that I need to give up the security
guarantee by switching to *developer mode*, in order to run a decent Linux
distro aside. Doing so will cause the laptop generates loud beep sound
if one does not press Ctrl+D to skip it at boot time and all data will be erased if one presses space bar and enter key, before the beep. At the moment I was giving up to
this plan of using crouton, Google held 2018 I/O event and announced *crostini*, a
way to run other Linux distros inside sandboxed lxc containers, one day before I got my Pixelbook.

The crostini environment currently works, but with hacky scripts. The sommelier [#]_
program emulates an X11/Wayland server that in turn forwards the rendering commands to
Chrome OS host, penetrating the container boundary. The good part of the story is,
with linux container technology, unlike traditional VM with fully emulated hardware, the sandboxed Linux system runs with very little overhead. The provided distro, Debian Stretch, is only slightly
adapted compared to the one given by Linux Containers [#]_. This gives me some hope
of figuring out how to apply the changes to in theory make containers of any Linux distros.

I use Archlinux since my conversion from Gentoo two years ago. It is easy to setup and
bare-bones enough to customize. It has very up-to-date binary packages and the rolling update does not break as frequently as in its early years. Archlinux also uses systemd as in Debian, so it shouldn't be hard to make it work in crostini.

.. role:: strike
    :class: strike

So far, I managed to run Archlinux as a container with working network, console, and Wayland display. I fixed the network issue using the lxc profile modification found here [#]_, and converted the Debian packages to make Wayland work. In theory, X11 should work as well, :strike:`but due to some bug inside sommelier, I'm currently unable to run any X11-only program` see the picture below.

To get Archlinux working on your Pixelbook, try the following steps (in termina prompt):

0. Adjust the profile for networking:

.. ccode:: bash

   lxc profile set default security.syscalls.blacklist "keyctl errno 38"

1. Create and run the container:

.. ccode:: bash

   run_container.sh --container_name archlinux --user ymf --lxd_image archlinux/current --lxd_remote https://us.images.linuxcontainers.org/

2. Enter the root shell:

.. ccode:: bash

   lxc exec archlinux -- bash

3. Or use console to login:

.. ccode:: bash

   lxc console archlinux

4. You can use bazel to build the Debian packages provided here [#]_, and convert them to Archlinux packages using debtap [#]_. The conversion isn't perfect, so don't forget to create a symlink from ``/usr/bin/sommelier`` to ``/opt/google/cros-containers/bin/sommelier``.

5. To avoid annoying retry messages, disable the ttys by ``systemctl disable getty@lxc-tty1``, and the other five.

6. For those slackers, here [#]_ is the link to the converted packages.

7. Finally, a picture is worth a thousand words:

.. simpic:: /images/pixelbook-with-archlinux.png
   :class: align-center

It shows a running Archlinux with a Wayland terminal emulator, proper fonts, Rust, Texlive, etc. Here is another picture showing X11 support with urxvt, fcitx IME and open file dialog of evince:

.. simpic:: /images/pixelbook-with-archlinux2.png
   :class: align-center

.. [#] https://chromium.googlesource.com/chromiumos/containers/sommelier
.. [#] https://linuxcontainers.org/
.. [#] https://github.com/lxc/lxd/issues/4071
.. [#] https://chromium.googlesource.com/chromiumos/containers/cros-container-guest-tools/
.. [#] https://aur.archlinux.org/packages/debtap/
.. [#] https://tedyin.com/archive/cros-archlinux/
