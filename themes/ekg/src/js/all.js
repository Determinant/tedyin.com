if (!window.console) console = {log: function() {}};

var posts = [];
var lasttime = 0;
var max_entries = 20;
var last_requested = null;

$(function() {
    if (true) //(!Modernizr.flexbox)
    {
        var flexer = function() {
            if ($(window).width() <= 991)
                return;
            var flex_height = $('.leftbar').height() - ($('.nav').outerHeight(true) +
                                                        $('.logo').outerHeight(true) +
                                                       $('.descr').outerHeight(true));
            $('#pushybox-container').css('height', flex_height);
        }
        $(flexer);
        $(window).bind('resize', flexer);
    }
    $('.vscroll-pane').mCustomScrollbar({
        axis: 'y',
        theme: 'rounded',
        autoHideScrollbar: true,
        autoDraggerLength: true,
        scrollInertia: 200,
        mouseWheel: { enable: true, axis: 'y', scrollAmount: 50}
    });
    $('.hscroll-pane').mCustomScrollbar({
        axis: 'x',
        theme: 'minimal',
        autoHideScrollbar: true,
        autoDraggerLength: true,
        scrollInertia: 100,
        mousewheel: { enable: true, axis: 'x', scrollAmount: 50}
    });
    long_polling();
    $('.navbar-toggle').each(function () {
        var e = $(this);
        var pane = $(e.attr('data-target'));
        var duration = 500;
        pane.css('overflow', 'hidden')
            .css('transition', 'height ' + duration + 'ms ease');
        function css_trans_slide_down() {
            pane.toggleClass('collapsed');
            pane.css('height', 'auto')
                .data('height', pane.innerHeight())
                .css('height', '0px');
            setTimeout(function () {
                pane.css('height', pane.data('height')+'px');
            }, 1);
        }

        function css_trans_slide_up() {
            setTimeout(function () {
                pane.css('height', '0px');
                setTimeout(function () {
                    pane.toggleClass('collapsed');
                    pane.css('height', 'auto');
                }, duration);
            }, 1);
        }

        function js_slide_down() {
            pane.stop().slideDown(duration, function () {
                pane.css('display', '');
                pane.toggleClass('collapsed');
            });
        }

        function js_slide_up() {
            pane.stop().slideUp(duration, function () {
                pane.css('display', '');
                pane.toggleClass('collapsed');
            });
        }

        var slide_down, slide_up;
        if (Modernizr.csstransitions)
        {
            slide_down = css_trans_slide_down;
            slide_up = css_trans_slide_up;
        }
        else
        {
            slide_down = js_slide_down;
            slide_up = js_slide_up;
        }
        e.on('click', function () {
            if (pane.hasClass('collapsed'))
                slide_down();
            else
                slide_up();
        });
    });
});

function long_polling() {
    var req_url = '/ajax?action=fetch&lasttime=' +
        lasttime + '&id=' + Math.random();
    last_requested = new Date();
    console.log("last time: " + lasttime + req_url);
    $.ajax({
        url: req_url,
        type: 'GET',
        cache: false,
        success: function(resp) {
            console.log("JSON Data: " + resp);
            for (var i = 0; i < resp.length; i++)
            {
                resp[i]['dom'] = $(
                '<li><div class="msgbox">' + 
                    '<span class="msg-text">' + resp[i]['text'] + '</span>' +
                    '<span class="date">' + resp[i]['date'] + '</span>' +
                '</div></li>').prependTo('#pushybox').hide();
                posts.push(resp[i]);
                if (posts.length > max_entries)
                {
                    var elem = posts[0]['dom'];
                    if (elem.is(":visible"))
                        elem.fadeOut(1000, function () { $(this).remove(); });
                    else
                        elem.remove();
                    posts.splice(0, 1);
                }
            }
    
            var slide = function (msg_idx) {
                if (msg_idx == posts.length) return;
                posts[msg_idx]['dom'].slideDown("slow", function () { slide(msg_idx + 1);});
            }

            if (posts.length > 0)
            {
                if (lasttime == 0)
                    for (var i = 0; i < posts.length; i++)
                    posts[i]['dom'].fadeIn(1000);
                else
                    slide(0);
                lasttime = posts[posts.length - 1]['time'];
                console.log("New last time: " + lasttime);
            }

            var api = $("#pushybox-container").data('jsp');
            if (api) api.reinitialise();
            long_polling();
        },
        dataType: 'json',
        error: function (a, b, c) {
            if (last_requested - (new Date()) > 5)
                long_polling();
            else
                setTimeout('long_polling();', 5000);
        }
    });
}

function post(mesg, pass) {
    var req_url = '/ajax?action=post&message=' + encodeURIComponent(mesg) +
                                    '&pass=' + encodeURIComponent(pass);
    console.log();
    $.ajax({
        url: req_url,
        type: 'GET',
        cache: false,
        dataType: 'json'
    });
}


var svg_doc = null;
var svg_animation_ongoing = true;

function svg_onload(e) {
    svg_doc = e.contentDocument;
    svg_doc.getElementById("pulse2").setAttribute("onend", "svg_animation_end();");
    svg_doc.svg_animation_end = svg_animation_end;
}

function trigger_pulse() {
    if (!svg_animation_ongoing)
    {
        svg_animation_ongoing = true;
        svg_doc.getElementById("pulse").beginElement();
    }
}

function svg_animation_end() {
    svg_animation_ongoing = false;
}

function remove_element(e) {
    e && e.parentNode && e.parentNode.removeChild(e);
}

function code_box(bid, data, linenostart) {
    var div = document.getElementById("codebox_" + bid);
    remove_element(document.getElementById("cbjs_" + bid));
    div.className = "code";
    div.style.display = "block";
    var lineno = document.createElement('div');
    var text = document.createElement('div');
    var wrapper = document.createElement('div');
    lineno.className = "lineno";
    text.className = "text hscroll-pane";
    wrapper.className = "wrapper";
    var linenos = [];
    var lines = document.createElement('div');
    lines.style.display = "inline-block";
    for (var i = 0; i < data.length; i++)
    {
        /*
        var line = document.createElement('span');
        var br = document.createElement('br');
        line.className = "line";
        line.innerHTML = data[i] ;
        text.appendChild(line);
        text.appendChild(br);
        */ 
        var line = document.createElement('div');
        line.innerHTML = data[i];
        while (line.firstChild)
        {
            var chd = line.firstChild;
            line.removeChild(chd);
            lines.appendChild(chd);
        }
        linenos.push(i + linenostart);
    }
    text.appendChild(lines);
    lineno.innerHTML = linenos.join('\n');
    div.appendChild(lineno);
    wrapper.appendChild(text);
    div.appendChild(wrapper);
}

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

var openPhotoSwipe = function(index, items, galleryUID, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
        gallery,
    options;
    // define options (if needed)
    options = {
        // define gallery index (for URL)
        galleryUID: galleryUID,
        //galleryUID: galleryElement.getAttribute('data-pswp-uid'),
        getThumbBoundsFn: function(index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            //var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
            var thumbnail = items[index].el, // find thumbnail
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

function path_split(p) {
    return p.match(/(.*)\/([^/]*)/);
}


$(function () {
    var items = [];
    $('img.simpic').each(function (idx) {
        var item = {
            src: path_split(this.src)[1] + '/' + path_split(this.getAttribute('data-target'))[2],
            msrc: this.src,
            w: this.getAttribute('data-orig-width'),
            h: this.getAttribute('data-orig-height'),
            el: this,
            title: this.getAttribute('data-title') || ''
        };
        this.onclick = function () {
            console.log(items);
            openPhotoSwipe(idx, items, 0);
        };
        items.push(item);
    });
    var hashData = photoswipeParseHash();
    if (hashData.pid && hashData.gid == 0) {
        openPhotoSwipe(hashData.pid, items, 0, true, true);
    }
});
