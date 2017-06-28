.. title: Scripts for Adding Bookmarks to a PDF
.. slug: scripts-for-adding-bookmarks-to-a-pdf
.. date: 2015-12-26 17:26:53 UTC+08:00
.. tags: hacking, pdf
.. category: coding
.. link: 
.. description: 
.. type: text
.. location: Singapore

As I gradually get used to reading more and more e-books, I find that it could be 100x more efficient if there were bookmarks that help you jump around the chapters for a scanned version pdf. It could be even more pleasant than reading the original paper-based book since the table of contents can be always on one side of the screen which is more accessible.

However, the true story is, those scanned pdfs usually don't come with such detailed bookmarks naturally. It is a painstaking task to use a pdf editing software to add bookmarks one after another via a graphical UI. Thus, a more desirable solution is to have a scripting-like way to add these bookmarks. Luckily, with the help of `Adobe pdfmark Reference <http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/pdfmark_reference.pdf>`_ and `this article <http://blog.tremily.us/posts/PDF_bookmarks_with_Ghostscript/>`_, it is fairly easy to achieve:

.. ccode:: python
   :number-lines: 1

   # -*- coding: utf-8 -*-
   def to_utf16_bom_string(str): # assume the input string is utf-8 encoded
       return "<feff{0}>".format("".join([hex(ord(l))[2:].zfill(2) for l in \
                                           str.decode('utf-8').encode('utf-16be')]))
   def gen_pdfmarks(tree, page_offset):
       res = []
       for entry in tree:
           if len(entry) == 3:
               title, page, sublevel = entry
           else:
               title, page = entry
               sublevel = None
           res.append("[{1} /Title {0}{2} /OUT pdfmark"\
               .format(to_utf16_bom_string(title),
                       " /Count {0}".format(len(sublevel)) if sublevel else "",
                       " /Page {0:d}".format(page + page_offset) if page else ""))
           if sublevel:
               res.extend(gen_pdfmarks(sublevel, page_offset))
       return res
   
   toc = [("目錄", -1),
          ("樂理初步", 1),
          ("吉他演奏法", 9),
          ("預備練習", 15),
          ("第一部", None,
              [("第一把位中的音階", 17),
               ("六度音練習", 19),
               ("分解和絃練習", 20),
               ("吉他演奏上的重要注意事項", 24),
               ("C大調", 26),
               ("G大調", 29),
               ("D大調", 32),
               ("A大調", 35),
               ("把位練習", 37),
               ("品味卡", 38),
               ("E大調", 39),
               ("F大調", 42),
               ("a小調", 45),
               ("e小調", 47),
               ("d小調", 49),
               ]),
           ("第二部", None,
               [("圓滑線", 53),
                ("圓滑奏練習", 54),
                ("滑奏", 56),
                ("倚音", 56),
                ("雙倚音", 57),
                ("迴音", 58),
                ("震音", 59),
                ("波音", 60),
                ("消音", 60),
                ("第四把位", 61),
                ("第五把位", 62),
                ("第七把位", 63),
                ("第九把位", 64),
                ("把位移動練習", 65),
                ("雙音", 69),
                ("鍾音奏法", 73),
                ("b小調", 74),
                ("#f小調", 74),
                ("#c小調", 75),
                ("B大調", 76),
                ("#g小調", 76),
                ("#F大調", 77),
                ("#d小調", 78),
                ("bB大調", 79),
                ("g小調", 79),
                ("bE大調", 80),
                ("c小調", 81),
                ("bA大調", 81),
                ("f小調", 82),
                ("bD大調", 82),
                ("bb小調", 83),
                ("泛音奏法", 83),
                ]),
           ("第三部", None,
               [("五十首難度漸進練習曲", 85),
                ]),
           ("第四部", None,
               [("野玫瑰", 139),
                ("搖籃曲", 140),
                ("船歌", 141),
                ("練習曲", 142),
                ("練習曲", 143),
                ("圓舞曲", 144),
                ("月光 (b小調練習曲)", 146),
                ("小行板", 147),
                ("加洛普舞曲", 148),
                ("小行板圓舞曲", 149),
                ("小奏鳴曲", 150),
                ("丑角之舞", 152),
                ("浪漫曲", 153),
                ("淚", 156),
                ("阿德麗塔", 157),
                ("搖籃曲", 158),
                ("帕凡舞曲", 160),
                ("春之歌", 162),
                ("小步舞曲", 164),
                ("阿爾罕布拉宮的回憶", 166)
                ]),
         ]
   
   print("\n".join(gen_pdfmarks(toc, 7)))

The code above is used for generating the bookmark description according to the pdfmarks reference. Finally, we can concatenate the original pdf file with the generated bookmark file. Therefore:

.. ccode:: bash
   :number-lines: 1

   python gen_bookmarks.py > carcassi_pdfmarks
   gs -dBATCH -dNOPAUSE -sPAPERSIZE=letter -sDEVICE=pdfwrite -sOutputFile="out.pdf" carcassi.pdf  carcassi_pdfmarks

Note that you need to change the variable ``toc`` in the above script to one which describes your table of contents.

.. thumbnail:: /images/bookmarks.png
   :align: center
