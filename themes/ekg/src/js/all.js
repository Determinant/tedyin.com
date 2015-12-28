if (!window.console) console = {log: function() {}};

var posts = [];
var lasttime = 0;
var max_entries = 20;

$(function() {
    if (true) //(!Modernizr.flexbox)
    {
        var flexer = function() {
            var flex_height = $('.leftbar').height() - ($('.nav').outerHeight(true) +
                                                        $('.logo').outerHeight(true) +
                                                       $('.descr').outerHeight(true));
            $('#pushybox-container').css('height', flex_height);
        }
        $(flexer);
        $(window).bind('resize', flexer);
    }
    $('.vscroll-pane').mCustomScrollbar({ axis: 'y', theme: 'rounded' });
    $('.hscroll-pane').mCustomScrollbar({ axis: 'x', theme: 'rounded', mousewheel: { enable: true, axis: 'x' }});
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
            console.log(b);
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

function code_box(bid, data) {
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
        linenos.push(i + 1);
    }
    text.appendChild(lines);
    lineno.innerHTML = linenos.join('\n');
    div.appendChild(lineno);
    wrapper.appendChild(text);
    div.appendChild(wrapper);
}
