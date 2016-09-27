
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        if(navigator.connection.type == 'none') {
            var element = document.getElementsByClassName('received');
            element = element[0];
            if (element) element.style.display = 'block';
            var checkConnect = setInterval(function() {
                console.log(navigator.connection.type);
                if(navigator.connection.type != 'none') {
                    clearInterval(checkConnect);
                    app.onDeviceConnected();
                }
            }, 400);
        } else {
            app.onDeviceConnected();
        }
    },
    onDeviceConnected: function(url) {
        url = url || 'http://xn--c1ajbipfgdikq.xn--p1ai/';
        var ref = cordova.InAppBrowser.open(url, '_blank', 'location=no,zoom=no');
        var loop;

        document.getElementsByClassName('received')[0].style.display = 'none';
        ref.addEventListener('loadstop', loadstopcb);

        ref.addEventListener('loaderror', loaderrorcb);

        function loadstopcb() {

            var inappFunc = "localStorage.removeItem('url');"+
            "$('a:not([href^=\"/\"], "+
            "[href^=\"http://xn--c1ajbipfgdikq.xn--p1ai/\"],"+
            " [href^=\"#\"], [href^=\"javascript\"])')."+
            "on('click', function(event){event.preventDefault();console.log('catch');"+
            "if (event.target.href.indexOf('http' === 0) && !localStorage.getItem('url')) {localStorage.setItem('url', event.target.href);console.log(event.target.href)}"+
            "return false;})";
            ref.executeScript({ code: inappFunc }, function(params) {
                console.log(params);
            });

            var intFunc = function() {
                // Execute JavaScript to check for the existence of a url in the
                // child browser's localStorage.
                if (intFunc.checked) return;
                ref.executeScript({
                    code: "localStorage.getItem('url')"
                },
                function(values) {
                    var name = values[0];
                    if (name) {
                        intFunc.checked = true;
                        ref.executeScript({
                            code: "localStorage.removeItem('url');"
                        }, function() {
                            intFunc.checked = false;
                            cordova.InAppBrowser.open(name, '_system', 'location=no,zoom=no');    
                        });
                    }
                });
            }
            intFunc.checked = false;

            loop = setInterval(intFunc, 100);
        }

        function loaderrorcb(err) {
            console.log(err);
            if (!err.url) return;
            clearInterval(loop);
            var reloadButton = document.querySelector('.reload');
            reloadButton.style.display = 'block';
            
            reloadButton.onclick = function() {
                app.onDeviceConnected(err.url);
                this.style.display = 'none';
            }

            ref.removeEventListener('loadstop', loadstopcb);
            ref.removeEventListener('loaderror', loaderrorcb);
            ref.close();
        }
    }
};
