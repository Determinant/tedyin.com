var photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1),
        params = {};

    if(hash.length < 5) {
        return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
        if(!vars[i]) {
            continue;
        }
        var pair = vars[i].split('=');
        if(pair.length < 2) {
            continue;
        }
        params[pair[0]] = pair[1];
    }

    if(params.gid) {
        params.gid = parseInt(params.gid, 10);
    }

    return params;
};

var openPhotoSwipe = function(index, items, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
        gallery,
    options;
    // define options (if needed)
    options = {

        // define gallery index (for URL)
        galleryUID: galleryElement.getAttribute('data-pswp-uid'),
        getThumbBoundsFn: function(index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        }

    };

    // PhotoSwipe opened from URL
    if(fromURL) {
        if(options.galleryPIDs) {
            // parse real index when custom PIDs are used
            // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
            for(var j = 0; j < items.length; j++) {
                if(items[j].pid == index) {
                    options.index = j;
                    break;
                }
            }
        } else {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
        }
    } else {
        options.index = parseInt(index, 10);
    }

    // exit if index not found
    if( isNaN(options.index) ) {
        return;
    }

    if(disableAnimation) {
        options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
};
var google_uid = "108853535017808641401";
var google_aid = "6211742483741396737";
var column_width = 200;
var max_results = 999;
$(function () {
    $.ajax({url: "http://picasaweb.google.com/data/feed/api/user/" + google_uid +
           "/albumid/" + google_aid +
               "?imgmax=1600" +
               "&max-results=" + max_results +
               "&start-index=1&alt=json",
           crossDomain: true, success: function (resp) {
               var container = document.getElementsByClassName("gphotos")[0];
               var items = [];
               $.each(resp.feed.entry, function (idx, val) {
                   var title = val.title.$t;
                   var summary = val.summary.$t;
                   var content = val.media$group.media$content[0];
                   var thumbnails = val.media$group.media$thumbnail;
                   var thumbnail = thumbnails[thumbnails.length - 1];
                   /* console.log(title, summary, content.url, content.width, content.height, thumbnail.url, thumbnail.width, thumbnail.height); */
                   var fig = document.createElement('div');
                   var img = document.createElement('img');
                   img.src = thumbnail.url;
                   img.style['min-height'] = column_width / thumbnail.width * thumbnail.height + 'px';
                   fig.appendChild(img);
                   fig.className = "item";
                   container.appendChild(fig);
                   var item = {
                       src: content.url,
                       w: content.width,
                       h: content.height,
                       el: fig,
                       title: title
                   };
                   function gen(idx) {
                       return function () {
                           openPhotoSwipe(idx, items, container);
                       };
                   }
                   fig.onclick = gen(items.length);
                   fig.setAttribute('data-pswp-uid', items.length);
                   items.push(item);
               });
               var hashData = photoswipeParseHash();
               if (hashData.pid) {
                   openPhotoSwipe(hashData.pid, items, container, true, true );
               }
               var wall = new freewall("#gphotos");
               wall.reset({
                   selector: '.item',
                   animate: true,
                   cellW: column_width,
                   cellH: 'auto',
                   onResize: function() { wall.fitWidth(); },
                   gutterX: 5,
                   gutterY: 5
               });
               wall.container.find('.item img').load(function() {
                                wall.fitWidth();
                                            });
           }});
});
