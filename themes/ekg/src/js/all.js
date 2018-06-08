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
                                                        $('.logo-rounded').outerHeight(true) +
                                                        $('.descr').outerHeight(true) +
                                                       $('.descr-rounded').outerHeight(true));
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
        mousewheel: { enable: true, axis: 'y', scrollAmount: 50}
    });
    $('.hscroll-pane').mCustomScrollbar({
        axis: 'x',
        theme: 'minimal',
        autoHideScrollbar: true,
        autoDraggerLength: true,
        scrollInertia: 100,
        mousewheel: { enable: false }
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

function code_box(bid, data, linenostart, linenos) {
    var collapsed_start = 50;
    var collapsed_trigger = 60;
    var div = document.getElementById("codebox_" + bid);
    remove_element(document.getElementById("cbjs_" + bid));
    div.className = "code";
    div.style.display = "block";
    var lineno = document.createElement('div');
    var lns = document.createElement('div');
    var text = document.createElement('div');
    var lines = document.createElement('div');
    var wrapper = document.createElement('div');
    var lwrapper = document.createElement('div');
    lineno.className = "lineno";
    text.className = "text hscroll-pane";
    wrapper.className = "wrapper";
    lwrapper.className = "lwrapper";
    var collapse = data.length > collapsed_trigger;
    var n = collapse ? collapsed_start + 1 : data.length;
    for (var i = 0; i < n; i++)
    {
        var line = document.createElement('div');
        var ln = document.createElement('div');
        line.innerHTML = data[i];
        lines.appendChild(line);
        ln.innerHTML = linenostart++;
        lns.appendChild(ln);
    }

    if (linenos)
        div.appendChild(lwrapper);
    div.appendChild(wrapper);

    lineno.appendChild(lns);
    wrapper.appendChild(text);

    text.appendChild(lines);
    lwrapper.appendChild(lineno);

    if (collapse)
    {
        var lines_rest = document.createElement('div');
        var lns_rest = document.createElement('div');
        lns_rest.className = 'lns-rest';
        lines_rest.className = 'lines-rest';
        for (var i = 0; i < data.length - n; i++)
        {
            var line = document.createElement('div');
            var ln = document.createElement('div');
            line.innerHTML = data[n + i];
            lines_rest.appendChild(line);
            ln.innerHTML = linenostart++;
            lns_rest.appendChild(ln);
        }
        text.appendChild(lines_rest);
        lineno.appendChild(lns_rest);
        var last_line = lines.children[collapsed_start];
        var last_lns = lns.children[collapsed_start];

        var more = document.createElement('div');
        var plus = document.createElement('div');
        var less = document.createElement('div');
        var minus = document.createElement('div');

        more.className = 'code-more';
        more.style.top = last_line.offsetTop + text.offsetTop + 'px';
        more.style.left = last_line.offsetLeft + text.offsetLeft + 'px';
        more.innerHTML = '<a>++ MORE ++</a>';

        lns_rest.style.display = 'none';
        lines_rest.style.display = 'none';
        var display = false;
        function toggle() {
            function gen_check(cnt) {
                return function check() {
                    if (--cnt == 0)
                        display = !display;
                }
            }
            if (!display)
            {
                check = gen_check(2);
                $(lns_rest).slideDown(400, check);
                $(lines_rest).slideDown(400, check);
            }
            else
            {
                check = gen_check(2);
                $(lns_rest).slideUp(400, check);
                $(lines_rest).slideUp(400, check);
            }
            $(more).toggleClass('hidden');
            $(plus).toggleClass('hidden');
            $(less).toggleClass('hidden');
            $(minus).toggleClass('hidden');
        };
        plus.className = 'code-more';
        plus.style.top = last_lns.offsetTop + 'px';
        plus.style.left = last_lns.offsetLeft + 'px';
        plus.innerHTML = '+';

        less.innerHTML = '<a>-- LESS --</a>';
        less.className = 'code-less hidden';

        minus.innerHTML = '-';
        minus.className = 'code-less hidden';

        more.onclick = toggle;
        less.onclick = toggle;

        wrapper.appendChild(more);
        wrapper.appendChild(less);

        lineno.appendChild(plus);
        lineno.appendChild(minus);
    }
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
            openPhotoSwipe(idx, items, 0);
        };
        items.push(item);
    });
    var hashData = photoswipeParseHash();
    if (hashData.pid && hashData.gid == 0) {
        openPhotoSwipe(hashData.pid, items, 0, true, true);
    }
});
