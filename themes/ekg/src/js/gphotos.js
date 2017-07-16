function block_element_and_wait(selector) {
    var note = document.createElement('div');
    var overlay = document.createElement('div');
    /* var height = Math.max(selector.height(), 200); */
    var height = selector.height();
    var width = selector.width();
    var pos = selector.position();
    var text = document.createElement('span');
    var spinner = document.createElement('span');

    text.innerHTML = "Please wait...";
    text.className = "blocknotetext";

    spinner.className = "glyphicon glyphicon-refresh spin";

    selector.toggleClass('blocked', true);
    note.className = "blocknote";
    note.style.top = (height - 50) / 2 + 'px';
    note.style.left = (width - 200) / 2 + 'px';
    note.appendChild(spinner);
    note.appendChild(text);

    overlay.className = "blockoverlay";
    overlay.style.top = pos.top + 'px';
    overlay.style.left = pos.left + 'px';
    overlay.style.height = height + 'px';
    overlay.style.width = width + 'px';
    overlay.appendChild(note);

    selector.after(overlay);
    selector.data('_blockoverlay', overlay);
    selector.data('_blocknote', note);
    selector.data('_blocked', true);
}

function unblock_element_and_finish(selector) {
    if (selector.data('_blocked'))
    {
        $(selector.data('_blockoverlay')).remove();
        $(selector.data('_blocknote')).remove();
        selector.data('_blocked', undefined);
        selector.toggleClass('blocked', false);
    }
}

var provider = "https://picasaweb.google.com";
//var provider = "http://tedyin.com/picasa";
var google_uid = "108853535017808641401";
var google_aid = "6211742483741396737";
var column_width = 200;
var max_results = 999;

$(function () {
    block_element_and_wait($('#gphotos'));
    $.ajax({url: provider + "/data/feed/api/user/" + google_uid +
           "/albumid/" + google_aid +
               "?imgmax=1600" +
               "&max-results=" + max_results +
               "&start-index=1&alt=json",
        crossDomain: true,
        timeout: 10000,
        success: function (resp) {
            var container = document.getElementById("gphotos");
            var guid = container.getAttribute('data-pswp-uid');
            var items = [];
            resp.feed.entry.reverse();
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
                    msrc: thumbnail.url,
                    w: content.width,
                    h: content.height,
                    el: fig,
                    title: title
                };
                function gen(idx) {
                    return function () {
                        openPhotoSwipe(idx, items, guid);
                    };
                }
                fig.onclick = gen(items.length);
                items.push(item);
             });
             var hashData = photoswipeParseHash();
             if (hashData.pid && hashData.gid == guid) {
                 openPhotoSwipe(hashData.pid, items, guid, true, true);
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
             unblock_element_and_finish($('#gphotos'));
             wall.container.find('.item img').load(function() {
                  wall.fitWidth();
             });
        },
        error: function () {
            console.log('failed');
            setTimeout(function () { $.ajax(this); }, 2000);
        }
    });
});
