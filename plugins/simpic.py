# -*- coding: utf-8 -*-

# Copyright © 2014-2017 Pelle Nilsson and others.

# Permission is hereby granted, free of charge, to any
# person obtaining a copy of this software and associated
# documentation files (the "Software"), to deal in the
# Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the
# Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice
# shall be included in all copies or substantial portions of
# the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
# KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
# WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
# PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
# OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
# OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
# OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""Thumbnail directive for reStructuredText."""

import os

from docutils.parsers.rst import directives, Directive
from nikola.plugin_categories import RestExtension
from docutils import nodes
from PIL import Image

class Plugin(RestExtension):
    """Plugin for thumbnail directive."""

    name = "rest_simpic"

    def set_site(self, site):
        """Set Nikola site."""
        self.site = site
        directives.register_directive('simpic', Thumbnail)
        return super(Plugin, self).set_site(site)


class Thumbnail(Directive):
    """Thumbnail directive for reST."""

    def align(argument):
        """Return thumbnail alignment."""
        return directives.choice(argument, Image.align_values)

    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True
    option_spec = {'alt': directives.unchanged,
                   'height': directives.length_or_unitless,
                   'width': directives.length_or_percentage_or_unitless,
                   'scale': directives.percentage,
                   'align': align,
                   'name': directives.unchanged,
                   'target': directives.unchanged_required,
                   'class': directives.class_option}

    def run(self):
        """Run the thumbnail directive."""
        uri = directives.uri(self.arguments[0])
        if uri.endswith('.svg'):
            # the ? at the end makes docutil output an <img> instead of an object for the svg, which colorbox requires
            self.arguments[0] = '.thumbnail'.join(os.path.splitext(uri)) + '?'
        else:
            self.arguments[0] = '.thumbnail'.join(os.path.splitext(uri))
        self.options['target'] = uri
        with Image.open('.' + uri) as im:
            ow, oh = im.size
        attrs = {'data-orig-width': ow,
                'data-orig-height': oh,
                'src': self.arguments[0],
                'data-target': uri}
        if 'class' in self.options:
            classes = self.options['class']
        else:
            classes = []
        classes.append('simpic')
        attrs['class'] = ' '.join(classes)
        raw_html = '<img {0}>'.format(
                        ' '.join(["{0}=\"{1}\"".format(i[0], i[1])
                                    for i in attrs.items()]))
        node = nodes.raw('', raw_html, format='html')
        return [node]
