import json, uuid
from docutils import nodes
import docutils.parsers.rst.directives.body
import docutils.parsers.rst.directives.misc
from docutils.parsers.rst.roles import set_classes
from docutils.parsers.rst import Directive, directives
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name
import pygments
import pygments.util
from nikola.plugin_categories import RestExtension

class CustomHtmlFormatter(HtmlFormatter):
    name = 'CHTML'
    aliases = ['chtml']
    filenames = ['*.html', '*.htm']

    def __init__(self, linenostart=1):
        super(CustomHtmlFormatter, self).__init__(linenos=None)
        self.linenostart = linenostart
    def wrap(self, source, outfile):
        return self._wrap_code(source)

    def _wrap_code(self, source):
        box_id = uuid.uuid4()
        yield 0, '<pre id="codebox_{0}" style="display:none;"><script id="cbjs_{0}">code_box("{0}", '.format(box_id)
        yield 0, json.dumps([t for i, t in source if i == 1])
        yield 0, ', {0});</script></pre>\n'.format(self.linenostart)

class CodeBlock(Directive):
    """Parse and mark up content of a code block."""
    optional_arguments = 1
    option_spec = {'class': directives.class_option,
                   'name': directives.unchanged,
                   'number-lines': directives.unchanged,  # integer or None
                   'linenos': directives.unchanged,
                   'tab-width': directives.nonnegative_int}
    has_content = True

    def run(self):
        self.assert_has_content()

        if 'linenos' in self.options:
            self.options['number-lines'] = self.options['linenos']
        if 'tab-width' in self.options:
            self.content = [x.replace('\t', ' ' * self.options['tab-width']) for x in self.content]

        if self.arguments:
            language = self.arguments[0]
        else:
            language = 'text'
        set_classes(self.options)
        classes = ['code']
        if language:
            classes.append(language)
        if 'classes' in self.options:
            classes.extend(self.options['classes'])

        code = '\n'.join(self.content)

        try:
            lexer = get_lexer_by_name(language)
        except pygments.util.ClassNotFound:
            raise self.error('Cannot find pygments lexer for language "{0}"'.format(language))

        if 'number-lines' in self.options:
            linenos = 'table'
            # optional argument `startline`, defaults to 1
            try:
                linenostart = int(self.options['number-lines'] or 1)
            except ValueError:
                raise self.error(':number-lines: with non-integer start value')
        else:
            linenos = False
            linenostart = 1  # actually unused

        if self.site.invariant:  # for testing purposes
            anchor_ref = 'rest_code_' + 'fixedvaluethatisnotauuid'
        else:
            anchor_ref = 'rest_code_' + uuid.uuid4().hex

        formatter = CustomHtmlFormatter(linenostart=linenostart)
        out = pygments.highlight(code, lexer, formatter)
        node = nodes.raw('', out, format='html')

        self.add_name(node)
        # if called from "include", set the source
        if 'source' in self.options:
            node.attributes['source'] = self.options['source']

        return [node]

docutils.parsers.rst.directives.body.CodeBlock = CodeBlock
docutils.parsers.rst.directives.misc.CodeBlock = CodeBlock

class Plugin(RestExtension):

    name = "rest_clisting"

    def set_site(self, site):
        self.site = site
        CodeBlock.site = site
        directives.register_directive('ccode', CodeBlock)
        directives.register_directive('ccode-block', CodeBlock)
        directives.register_directive('csourcecode', CodeBlock)
        return super(Plugin, self).set_site(site)
