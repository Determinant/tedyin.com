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
fname = "../../../output/assets/css/images/160.svg"
svg = etree.parse(fname).getroot()
svg.set("id", "score")
svg.set("onLoad", "show();")
root[1].append(svg)
et = etree.ElementTree(root)
et.write(sys.stdout)
