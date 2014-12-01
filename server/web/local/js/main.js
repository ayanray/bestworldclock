function Clock(locale, label) {

    var _locale = locale;
    var _time = null;
    var _elapsed = 0;
    var seconds = 0;

    this.label = label;

    this.getLocale = function() {
        return _locale;
    };

    this.setTime = function(time) {
        _time = time;
        _elapsed = 0;
    }

    this.getTime = function() {

        if (!_time) {
            this.refreshTime();
        }

        return _time;
    };

    this.getMoment = function() {
        if (!_time) {
            return moment();
        }

        var time = this.getTime();

        return moment(time.getDateTimeStamp()).add(_elapsed, 's');
    };

    this.refreshTime = function() {
        BestWorldClock.refreshTimes();
    };

    this.tick = function() {
        _elapsed += 1;
    };
}

function Time(h, m, s, am, dts) {

    var _creationTime = new Date().getTime() / 1000;
    var _h = h;
    var _m = m;
    var _s = s;
    var _am = am;
    var _datetimestamp = dts;

    this.creationTime = function() {
        return _creationTime;
    };

    this.getHours = function() {
        return _h;
    };

    this.getMinutes = function() {
        return _m;
    };

    this.getSeconds = function() {
        return _s;
    };

    this.isAM = function() {
        return _am;
    };

    this.getDateTimeStamp = function() {
        return _datetimestamp;
    }
}

var BestWorldClock = {

    clocks: new Array(),

    seconds: 0,

    refreshTimes: function() {

        var localesString = [];
        for (var i = 0; i < this.clocks.length; i++) {
            localesString.push(this.clocks[i].getLocale());
        }

        localesString = localesString.join(',');

        $.getJSON("http://www.bestworldclock.com/time.php?callback=?&timezone="+localesString, {})
            .done(function(data) {

                for (var i = 0; i < data.length; i++) {
                    var clock = BestWorldClock.getClock(data[i].locale);
                    if (clock) {
                        clock.setTime( new Time(data[i].h, data[i].m, data[i].s, parseInt(data[i].h) < 12, data[i].dts));
                    }
                }

            });
    },

    getClock: function(locale) {

        for (var i = 0; i < this.clocks.length; i++) {

            if (locale == this.clocks[i].getLocale()) {
                return this.clocks[i];
            }
        }

        return null;
    },

    addClockNew: function(clock) {

        // Make Dictionary
        var locales = {};
        for (var i = 0; i < this.clocks.length; i++) {
            locales[this.clocks[i].getLocale()] = true;
        }

        if (locales.hasOwnProperty(clock.getLocale())) {
            return false;
        }

        this.clocks.push(clock);
        this.save();
        this.redrawAll();
    },

    removeClockNew: function(locale) {

        for (var i = 0; i < this.clocks.length; i++) {

            if (locale == this.clocks[i].getLocale()) {

                this.clocks.splice(i,1);

                this.save();
                this.redrawAll();
                return true;
            }
        }

        return false;
    },

    save: function() {

        var myAry = [];
        for (var i = 0; i < this.clocks.length; i++) {
            myAry.push({l1: this.clocks[i].getLocale(),l2: this.clocks[i].label});
        }

        var asString = JSON.stringify(myAry);
        setCookie('locales', asString);
    },

    restore: function() {

        var locales = getCookie('locales');
        if (!locales || locales == '[]') {

            BestWorldClock.addClockNew(new Clock('America/Los_Angeles', 'Los Angeles'));
            return;
        }

        var storedAry = JSON.parse(locales);

        console.log(storedAry);
        console.log(locales);

        if (storedAry.length) {
            this.clocks = [];
        }

        for (var i = 0; i < storedAry.length; i++) {
            this.addClockNew(new Clock(storedAry[i].l1, storedAry[i].l2));
        }
    },

    redrawAll: function() {
        this.redrawClocks();
        this.redrawList();
    },

    redrawClocks: function() {

        $("#watch-container").children().remove();

        for (var i = 0; i < this.clocks.length; i++) {

            var clock = this.clocks[i];

            var $watch = $( "#watch1" ).clone().appendTo( "#watch-container").removeAttr("id");
            $watch.find('.city').html(clock.label);

            var time = clock.getTime();
            if (time) {
                BestWorldClock.moveClock($watch, time.getHours(), time.getMinutes(), time.getSeconds(), time.isAM());
            }

            $watch.show();

            EnableClock($watch, clock.getLocale());
        }

        return true;
    },

    redrawList: function() {

        console.log("Redrawing list...");

        $("#watch-list-container li:not(:first-child)").remove();

        for (var i = 0; i < this.clocks.length; i++) {

            var clock = this.clocks[i];

            var $watch_row = $("#watch-row").clone().appendTo("#watch-list-container").removeAttr("id");

            $watch_row.find('.row-label').html(clock.label);
            $watch_row.find('.timezone_id').html(clock.getLocale());

            $watch_row.show();
        }

        var $watch_list_empty = $("#watch-list-empty");

        if (this.clocks.length > 0) {
            $watch_list_empty.hide();
        } else {
            $watch_list_empty.show();
        }

        return true;
    },

    moveClock: function($watch, h, m, s, am) {
//        var degree = h / 12 * 360;
//        $watch.find('.hours-hand').css({ 'transform': 'rotate(' + degree + 'deg)'});
//
//        degree = m / 60 * 360;
//        $watch.find('.minutes-hand').css({ 'transform': 'rotate(' + degree + 'deg)'});
//
//        degree = s / 60 * 360;
//        $watch.find('.seconds-hand').css({ 'transform': 'rotate(' + degree + 'deg)'});
//
//        if (am) {
//            $watch.find('.frame-time').html('AM');
//        } else {
//            $watch.find('.frame-time').html('PM');
//        }

    },

    onRemoveClock: function(clock) {

        var $btn = $(clock).parent().parent();
        var timezone = $btn.children('.timezone_id').html();

        this.removeClockNew(timezone);
    },

    onAddClock: function() {

        var timezone = $('#watch_list_form').val();
        var label = $("#watch_list_form option:selected").text();

        var sections = label.split('(');
        var city = sections[0];

        BestWorldClock.addClockNew(new Clock(timezone, city));
    },

    onTick: function() {

        // Get first seconds
        if (this.clocks.length == 0) {
            return;
        }

        var seconds = this.clocks[0].getMoment().seconds();

        for (var i = 0; i < this.clocks.length; i++) {

            this.clocks[i].tick();
            this.clocks[i].seconds = seconds;
        }


        for (i = 0; i < this.clockCallbacks.length; i++) {
            this.clockCallbacks[i]();
        }
    },

    clockCallbacks: new Array(),

    addTimeZone: function(label, value) {

        $("#watch_list_form").append($('<option>', {value: value}).text(label));
    }
};

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

$(document).ready(function(){

    $.getJSON("http://www.bestworldclock.com/timezone.php?callback=?", {})
        .done(function(data) {
            for (var i = 0; i < data.length; i++) {
                BestWorldClock.addTimeZone(data[i].city + ' ( '+data[i].diff_from_GMT+' )', data[i].zone);
            }
        });

    BestWorldClock.restore();

    setInterval(function() {
        BestWorldClock.onTick();
    }, 1000);

    window.scrollTo(
        (document.body.offsetWidth -document.documentElement.offsetWidth )/2,
        (document.body.offsetHeight-document.documentElement.offsetHeight)/2
    );

//    BestWorldClock.addClockNew(new Clock('Africa/Abidjan', 'Abidjan'));
//    BestWorldClock.addClockNew(new Clock('Africa/Accra', 'Accra'));

    $("#watch-list-container").sortable({
        update : function(event, ui) {
            var index = $(ui.item).index();

            var locale = $(ui.item).children('.timezone_id').html();

            for (var i = 0; i < BestWorldClock.clocks.length; i++) {
                if (BestWorldClock.clocks[i].getLocale() == locale) {
                    BestWorldClock.clocks.move(i, index-1);
                }
            }

            BestWorldClock.redrawClocks();
        }
    });
    $("#watch-list-container").disableSelection();

});
