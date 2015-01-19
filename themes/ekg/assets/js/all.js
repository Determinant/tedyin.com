function adjust() {

    bar=$('.navbar-fixed-left');
/*
    $('#container').css({
        'margin-left': bar.width() + 50 + $(window).width() * 0.1
    });
    */

    bar.css({
        'left': -$(this).scrollLeft() + 50
    });
}
/*
$(window).scroll(adjust);
$(window).resize(adjust);
$(window).load(adjust);
*/
if (!window.console) console = {log: function() {}};
var posts = [];
var lasttime = 0;
var max_entries = 20;
//var server_addr = '192.168.248.130';
var server_addr = 'tedyin.com';

function long_polling() {
    var req_url = 'http://' + server_addr + '/ajax?action=fetch&lasttime=' +
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
                '<div class="msg_box">' + 
                    '<span class="msg_text">' + resp[i]['text'] + '</span>' +
                    '<span class="date">' + resp[i]['date'] + '</span>' +
                '</div>').prependTo('#pushy_box').hide();
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
            long_polling();
        },
        dataType: 'json',
        error: function (a, b, c) {
            console.log(b);
            setTimeout('long_polling();', 5000);
        }
    });
}

function post(mesg) {
    var req_url = 'http://' + server_addr + '/ajax?action=post&message=' + encodeURIComponent(mesg);
    console.log();
    $.ajax({
        url: req_url,
        type: 'GET',
        cache: false,
        dataType: 'json'
    });
}

long_polling();

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

