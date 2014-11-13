from lxml import etree
import sys
root = etree.fromstring("""
<html>
<head>
<script>
    function show() {
        box = document.getElementById("score").getBBox();
        document.write(box.x + " " + box.y + " " + box.width + " " + box.height);
    }
</script>
</head>
<body></body>
</html>""")
svg = etree.parse("lesson_in_a_minor.svg").getroot()
svg.set("id", "score")
svg.set("onLoad", "show();")
root[1].append(svg)
et = etree.ElementTree(root)
et.write(sys.stdout)
