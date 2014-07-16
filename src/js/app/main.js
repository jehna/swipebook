var j = {};

$(function() {
    
    setTimeout(function() {
        j.SwipeBook.refresh();
    }, 100);
    
    window.fbAsyncInit = function() {
        FB.init({
          appId      : '816021041756653',
          cookie     : true,  // enable cookies to allow the server to access 
                              // the session
          xfbml      : true,  // parse social plugins on this page
          version    : 'v2.0' // use version 2.0
        });
        
        
        var tryLogin = setInterval(function() {
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    j.SwipeBook.run();
                    clearInterval(tryLogin);
                    $("body").removeClass("login");
                } else {
                    $("body").removeClass("loading");
                    $("body").addClass("login");
                }
                $("body").removeClass("initializing");
            });
        }, 1000);
    };
    
    
    j.SwipeBook = (function() {
        
        var templates = ["status",
                         "photo",
                         "link"];
        
        function SwipeBook() {
            j.templates = {};
            templates.forEach(function(templateName) {
                j.templates[templateName] = Handlebars.compile($("#template-" + templateName).html());
            });
        }
        
        SwipeBook.prototype.run = function() {
            this.refresh();
            this.fetch();
        };
        
        SwipeBook.prototype.fetch = function(next, since) {
            since = since || j.entries.most_recent;
            
            var params = {
                limit: 3,
                since: Math.floor(since.getTime()/1000)
            };
            
            $("body").addClass("loading");
            
            var self = this;
            var callback = function(response) {
                response.data.forEach(function(entry) {
                    j.entries.Add(entry.id, entry);
                });
                self.refresh();
                if(response.data.length > 0) {
                    self.fetch(response.paging.next, since);
                } else {
                    $("body").removeClass("loading");
                }
            };
            
            if(!next) {
                FB.api('/me/home', 'get', params, callback);
            } else {
                FB.api(next, 'get', {since: params.since}, callback);
            }
        };
        
        SwipeBook.prototype.refresh = function() {
            var hasEntries = false;
            
            j.entries.entries.forEach(function(entry) {
                if(!entry) return;
                if( !j.templates[entry.type] ) return;// console.log(entry.type);
                if( entry.type == "status" && !entry.message ) return;// console.log(entry.type);
                hasEntries = true;
                if($("#" + entry.id).length !== 0) return;
                
                //console.log(entry);
                var $template = $("<div />").html(j.templates[entry.type](entry)).appendTo($("#feed")).addClass("composite").attr("id", entry.id);
                
                // Set dragging
                var dragStart = 0;
                var winWidth = $(window).width();
                var lastPoint = 0;
                var prevented = false;
                $template.get(0).addEventListener("touchstart", function(e) {
                    prevented = false;
                    dragStart = e.touches[0].clientX;
                    $template.removeClass("animateSwipe");
                }, false);
                $template.get(0).addEventListener("touchmove", function(e) {
                    var currPoint = e.touches[0].clientX;
                    var diff = currPoint - dragStart;
                    var diffPercent = Math.max(-1,Math.min(1, diff/(winWidth/2)));
                    lastPoint = diffPercent;
                    
                    if(Math.abs(diffPercent) > 0.1 || prevented) {
                        e.preventDefault();
                        prevented = true;
                    } else if(!prevented) {
                        return;
                    }
                    
                    $template.css({
                        "-webkit-transform": "rotateZ("+(diffPercent * 45)+"deg)",
                        "opacity": 1-Math.abs(diffPercent)
                    });
                }, false);
                $template.get(0).addEventListener("touchend", function(e) {
                    $template.addClass("animateSwipe");
                    
                    if(Math.abs(lastPoint) > 0.55) {
                        var deg = lastPoint > 0 ? 90 : -90;
                        $template.slideUp();
                        $template.css({
                            "-webkit-transform": "rotateZ("+deg+"deg)",
                            "opacity": "0%"
                        });
                        j.entries.Delete(entry.id);
                        j.SwipeBook.refresh();
                    } else {
                        $template.removeAttr("style");
                    }
                }, false);
                
                // Grab additional parameters
                /*if(entry.type == "photo") {
                    FB.api(entry.object_id, 'get', {}, function(data) {
                        entry.postfetch = data;
                        $template.html( j.templates[entry.type](entry) );
                    });
                }*/
            });
            
            if(!hasEntries) {
                $("body").addClass("allread");
            } else {
                $("body").removeClass("allread");
            }
        };
        
        return new SwipeBook();
        
    })();
    
    j.Login = function() {
        FB.login(null, {
            scope: 'read_stream', 
            return_scopes: true
        });
    };
    
    j.Logout = function() {
        FB.logout();
        $("body").removeClass("login");
    };
    
    j.entries = (function() {
        
        function Entries() {
            this.entries = [];
            for( var i in localStorage ) {
                if( i.indexOf("entry-") === 0 ) {
                    var entry = JSON.parse(localStorage[i]);
                    this.entries.push(entry);
                }
            }
            this.Refresh();
            var most_recent = localStorage.getItem("most_recent");
            this.most_recent = most_recent ? new Date(most_recent) : new Date(new Date().getTime() - (1000*60*60*3));
        }
        
        Entries.prototype.Delete = function(id) {
            localStorage.setItem("entry-" + id, false);
            for( var i in this.entries ){
                if(this.entries[i].id == id) {
                    delete this.entries[i];
                    return;
                }
            }
            this.Refresh();
        };
        
        Entries.prototype.Refresh = function() {
            this.entries.sort(function(x, y){
                if(!x && !y) return 0;
                if(!x) return -1;
                if(!y) return -1;
                
                if (new Date(x.updated_time) < new Date(y.updated_time)) {
                    return -1;
                }
                if (new Date(x.updated_time) > new Date(y.updated_time)) {
                    return 1;
                }
                return 0;
            });
        };
        
        Entries.prototype.Add = function(id, entry) {
            if( localStorage.getItem("entry-" + id) !== null ) return;
            this.entries.push(entry);
            localStorage.setItem("entry-" + id, JSON.stringify(entry));
            
            if(entry.updated_time) {
                var entry_time = new Date(entry.updated_time);
                if( entry_time > this.most_recent ) {
                    this.most_recent = entry_time;
                    localStorage.setItem("most_recent", entry_time);
                }
            }
            this.Refresh();
        };
        
        
        return new Entries();
    })();
});
