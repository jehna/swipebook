var j = {};

$(function() {
    setTimeout(function() {
        j.SwipeBook.refresh();
    }, 100), window.fbAsyncInit = function() {
        FB.init({
            appId: "816021041756653",
            cookie: !0,
            xfbml: !0,
            version: "v2.0"
        });
        var a = setInterval(function() {
            FB.getLoginStatus(function(b) {
                "connected" === b.status ? (j.SwipeBook.run(), clearInterval(a), $("body").removeClass("login")) : ($("body").removeClass("loading"), 
                $("body").addClass("login")), $("body").removeClass("initializing");
            });
        }, 1e3);
    }, j.SwipeBook = function() {
        function a() {
            j.templates = {}, b.forEach(function(a) {
                j.templates[a] = Handlebars.compile($("#template-" + a).html());
            });
        }
        var b = [ "status", "photo", "link" ];
        return a.prototype.run = function() {
            this.refresh(), this.fetch();
        }, a.prototype.fetch = function(a, b) {
            b = b || j.entries.most_recent;
            var c = {
                limit: 3,
                since: Math.floor(b.getTime() / 1e3)
            };
            $("body").addClass("loading");
            var d = this, e = function(a) {
                a.data.forEach(function(a) {
                    j.entries.Add(a.id, a);
                }), d.refresh(), a.data.length > 0 ? d.fetch(a.paging.next, b) : $("body").removeClass("loading");
            };
            a ? FB.api(a, "get", {
                since: c.since
            }, e) : FB.api("/me/home", "get", c, e);
        }, a.prototype.refresh = function() {
            var a = !1;
            j.entries.entries.forEach(function(b) {
                if (b && j.templates[b.type] && ("status" != b.type || b.message) && (a = !0, 0 === $("#" + b.id).length)) {
                    var c = $("<div />").html(j.templates[b.type](b)).appendTo($("#feed")).addClass("composite").attr("id", b.id), d = 0, e = $(window).width(), f = 0, g = !1;
                    c.get(0).addEventListener("touchstart", function(a) {
                        g = !1, d = a.touches[0].clientX, c.removeClass("animateSwipe");
                    }, !1), c.get(0).addEventListener("touchmove", function(a) {
                        var b = a.touches[0].clientX, h = b - d, i = Math.max(-1, Math.min(1, h / (e / 2)));
                        if (f = i, Math.abs(i) > .1 || g) a.preventDefault(), g = !0; else if (!g) return;
                        c.css({
                            "-webkit-transform": "rotateZ(" + 45 * i + "deg)",
                            opacity: 1 - Math.abs(i)
                        });
                    }, !1), c.get(0).addEventListener("touchend", function() {
                        if (c.addClass("animateSwipe"), Math.abs(f) > .55) {
                            var a = f > 0 ? 90 : -90;
                            c.slideUp(), c.css({
                                "-webkit-transform": "rotateZ(" + a + "deg)",
                                opacity: "0%"
                            }), j.entries.Delete(b.id), j.SwipeBook.refresh();
                        } else c.removeAttr("style");
                    }, !1);
                }
            }), a ? $("body").removeClass("allread") : $("body").addClass("allread");
        }, new a();
    }(), j.Login = function() {
        FB.login(null, {
            scope: "read_stream",
            return_scopes: !0
        });
    }, j.Logout = function() {
        FB.logout(), $("body").removeClass("login");
    }, j.entries = function() {
        function a() {
            this.entries = [];
            for (var a in localStorage) if (0 === a.indexOf("entry-")) {
                var b = JSON.parse(localStorage[a]);
                this.entries.push(b);
            }
            this.Refresh();
            var c = localStorage.getItem("most_recent");
            this.most_recent = new Date(c ? c : new Date().getTime() - 108e5);
        }
        return a.prototype.Delete = function(a) {
            localStorage.setItem("entry-" + a, !1);
            for (var b in this.entries) if (this.entries[b].id == a) return void delete this.entries[b];
            this.Refresh();
        }, a.prototype.Refresh = function() {
            this.entries.sort(function(a, b) {
                return a || b ? a && b ? new Date(a.updated_time) < new Date(b.updated_time) ? -1 : new Date(a.updated_time) > new Date(b.updated_time) ? 1 : 0 : -1 : 0;
            });
        }, a.prototype.Add = function(a, b) {
            if (null === localStorage.getItem("entry-" + a)) {
                if (this.entries.push(b), localStorage.setItem("entry-" + a, JSON.stringify(b)), 
                b.updated_time) {
                    var c = new Date(b.updated_time);
                    c > this.most_recent && (this.most_recent = c, localStorage.setItem("most_recent", c));
                }
                this.Refresh();
            }
        }, new a();
    }();
});