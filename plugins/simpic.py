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

from docutils.parsers.rst import directives
from docutils.parsers.rst.directives.images import Image, Figure

from nikola.plugin_categories import RestExtension
import docutils
from xml.dom.minidom import parseString
from PIL import Image as Image2

class Plugin(RestExtension):
    """Plugin for thumbnail directive."""

    name = "rest_simpic"

    def set_site(self, site):
        """Set Nikola site."""
        self.site = site
        directives.register_directive('simpic', Thumbnail)
        return super(Plugin, self).set_site(site)


class Thumbnail(Figure):
    """Thumbnail directive for reST."""

    def align(argument):
        """Return thumbnail alignment."""
        return directives.choice(argument, Image.align_values)

    def figwidth_value(argument):
        """Return figure width."""
        if argument.lower() == 'image':
            return 'image'
        else:
            return directives.length_or_percentage_or_unitless(argument, 'px')

    option_spec = Image.option_spec.copy()
    option_spec['figwidth'] = figwidth_value
    option_spec['figclass'] = directives.class_option
    has_content = True

    def run(self):
        """Run the thumbnail directive."""
        uri = directives.uri(self.arguments[0])
        if uri.endswith('.svg'):
            # the ? at the end makes docutil output an <img> instead of an object for the svg, which colorbox requires
            self.arguments[0] = '.thumbnail'.join(os.path.splitext(uri)) + '?'
        else:
            self.arguments[0] = '.thumbnail'.join(os.path.splitext(uri))
        self.options['target'] = uri
        with Image2.open('.' + uri) as im:
            ow, oh = im.size
        attrs = {'data-orig-width': str(ow),
                'data-orig-height': str(oh),
                'data-target': uri}
        (orig_node,) = Image.run(self)
        html_doc = docutils.utils.new_document("")
        html_doc.append(orig_node)
        html_root = parseString(docutils.core.publish_from_doctree(html_doc, writer_name='html').decode())
        html_node = html_root.getElementsByTagName("img")[0]
        for key, val in attrs.items():
            html_node.setAttribute(key, val)
        html_node.setAttribute('class', "{0} simpic".format(html_node.getAttribute('class')))
        raw_html = html_node.toxml()
        node = docutils.nodes.raw('', raw_html, format='html')
        return [node]
