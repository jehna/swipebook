
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
                }
            });
        }, 1000);
    };
    
    var j = {};
    
    $(function() {
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
                var self = this;
                this.refresh();
                FB.api('/me/home', 'get', {}, function(response) {
                    response.data.forEach(function(entry) {
                        j.entries.Add(entry.id, entry);
                    });
                    self.refresh();
                });
            };
            
            SwipeBook.prototype.refresh = function() {
                console.log("Jeeejee", j.entries);
                j.entries.entries.forEach(function(entry) {
                    if(!entry) return;
                    if($("#" + entry.id).length !== 0) return;
                    
                    console.log(entry);
                    if( !j.templates[entry.type] ) return console.log(entry.type);
                    
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
            };
            
            return new SwipeBook();
            
        })();
        
        j.Login = function() {
            FB.login(null, {
                scope: 'read_stream', 
                return_scopes: true
            });
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
            }
            
            Entries.prototype.Delete = function(id) {
                localStorage.setItem("entry-" + id, false);
                for( var i in this.entries ){
                    if(this.entries[i].id == id) {
                        delete this.entries[i];
                        return;
                    }
                }
            };
            
            Entries.prototype.Add = function(id, entry) {
                if( localStorage.getItem("entry-" + id) !== null ) return;
                this.entries.push(entry);
                localStorage.setItem("entry-" + id, JSON.stringify(entry));
            };
            
            
            return new Entries();
        })();
    });
    