window.fbAsyncInit = function() {
    FB.init({
        appId: "816021041756653",
        cookie: !0,
        xfbml: !0,
        version: "v2.0"
    });
    var a = setInterval(function() {
        FB.getLoginStatus(function(b) {
            "connected" === b.status && (j.SwipeBook.run(), clearInterval(a));
        });
    }, 1e3);
};

var j = {};

$(function() {
    j.SwipeBook = function() {
        function a() {
            j.templates = {}, b.forEach(function(a) {
                j.templates[a] = Handlebars.compile($("#template-" + a).html());
            });
        }
        var b = [ "status", "photo", "link" ];
        return a.prototype.run = function() {
            this.refresh(), this.fetch(!1, j.entries.most_recent);
        }, a.prototype.fetch = function(a, b) {
            var c = {
                limit: 3,
                since: Math.floor(b.getTime() / 1e3)
            }, d = this, e = function(a) {
                console.log(a), a.data.forEach(function(a) {
                    j.entries.Add(a.id, a);
                }), d.refresh(), a.data.length > 0 && d.fetch(a.paging.next, b);
            };
            a ? FB.api(a, "get", {
                since: c.since
            }, e) : FB.api("/me/home", "get", c, e);
        }, a.prototype.refresh = function() {
            j.entries.entries.forEach(function(a) {
                if (a && 0 === $("#" + a.id).length && j.templates[a.type]) {
                    var b = $("<div />").html(j.templates[a.type](a)).appendTo($("#feed")).addClass("composite").attr("id", a.id), c = 0, d = $(window).width(), e = 0, f = !1;
                    b.get(0).addEventListener("touchstart", function(a) {
                        f = !1, c = a.touches[0].clientX, b.removeClass("animateSwipe");
                    }, !1), b.get(0).addEventListener("touchmove", function(a) {
                        var g = a.touches[0].clientX, h = g - c, i = Math.max(-1, Math.min(1, h / (d / 2)));
                        if (e = i, Math.abs(i) > .1 || f) a.preventDefault(), f = !0; else if (!f) return;
                        b.css({
                            "-webkit-transform": "rotateZ(" + 45 * i + "deg)",
                            opacity: 1 - Math.abs(i)
                        });
                    }, !1), b.get(0).addEventListener("touchend", function() {
                        if (b.addClass("animateSwipe"), Math.abs(e) > .55) {
                            var c = e > 0 ? 90 : -90;
                            b.slideUp(), b.css({
                                "-webkit-transform": "rotateZ(" + c + "deg)",
                                opacity: "0%"
                            }), j.entries.Delete(a.id);
                        } else b.removeAttr("style");
                    }, !1);
                }
            });
        }, new a();
    }(), j.Login = function() {
        FB.login(null, {
            scope: "read_stream",
            return_scopes: !0
        });
    }, j.entries = function() {
        function a() {
            this.entries = [];
            for (var a in localStorage) if (0 === a.indexOf("entry-")) {
                var b = JSON.parse(localStorage[a]);
                this.entries.push(b);
            }
            this.entries.sort(function(a, b) {
                return a || b ? a && b ? new Date(a) < new Date(b) ? -1 : new Date(a) > new Date(b) ? 1 : 0 : -1 : 0;
            });
            var c = localStorage.getItem("most_recent");
            this.most_recent = new Date(c ? c : new Date().getTime() - 108e5);
        }
        return a.prototype.Delete = function(a) {
            localStorage.setItem("entry-" + a, !1);
            for (var b in this.entries) if (this.entries[b].id == a) return void delete this.entries[b];
        }, a.prototype.Add = function(a, b) {
            if (null === localStorage.getItem("entry-" + a) && (this.entries.push(b), localStorage.setItem("entry-" + a, JSON.stringify(b)), 
            b.updated_time)) {
                var c = new Date(b.updated_time);
                c > this.most_recent && (this.most_recent = c, localStorage.setItem("most_recent", c));
            }
        }, new a();
    }();
});