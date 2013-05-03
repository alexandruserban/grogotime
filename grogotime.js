/* all timers in this script are created using this function */
function Timer(init_data) {
    this.data = ['status', 'time', 'index', 'last_time', 'title'];
    this.export_data = {};
    this.current_time = new Date().getTime()
    
    for(var key in this.data) {
        this[this.data[key]] = init_data[this.data[key]];
    }
    if (this.status === 1) {
        this.time += Math.floor((this.current_time - this.last_time) / 1000);    
    }
    this.play = function () {
        this.status = 1;
        this.last_time = new Date().getTime();
    };
    this.pause = function () {
        this.status = 0;
        this.last_time = 0;
    };
    this.edit = function () {
        this.status = 2;
    };
    this.save = function () {
        this.save = 3;
    };
    this.delete = function () {
        this.status = -1;
    };
    this.export = function () {
        for(var key in this.data) {
            this.export_data[this.data[key]] = this[this.data[key]];
        }
        
        return this.export_data;
    };
}
/* show elapsed time in a friendly way */
function convertSeconds(s) {
  var m = 0;
  var h = 0;
  var d = 0;
  if (s >= 3600 * 24) {
      d = parseInt(s / (3600 * 24));
      s = parseInt(s % (3600 * 24));
  }  
  if (s >= 3600) {
      h = parseInt(s / 3600);
      s = parseInt(s % 3600);
  }
  if (s >= 60) {
      m = parseInt(s / 60);
      s = parseInt(s % 60);
  }
  if (d > 0) {
    d = (d < 10 ? '0' + d : d) + (d > 1 ? ' days ' : ' day ');
  }  
  if (h > 0 || d) {
    h = (h < 10 ? '0' + h : h) + ' : ';
  }
  if (m > 0 || h) {
    m = (m < 10 ? '0' + m : m) + ' : ';
  }
  if (s > 0 || m) {
    s = s < 10 ? '0' + s : s;
  }
  
  return  (d > 0 || d.length > 0 ? d : '<span class="not_visible">00 days </span>')
          + (h > 0 || h.length > 0 ? h : '00 : ')
          + (m > 0 || m.length > 0 ? m : '00 : ')
          + s;
}
/* this will return the template that will be appended to the other items */
function Template(tpl, populating_data) {
	for(to_replace in populating_data) {
		tpl = tpl.replace(new RegExp('%' + to_replace + '%', 'g'), populating_data[to_replace]);
	}
	
    return tpl;
}
/* a timer has these DOM elements that need action binding */
function _timerDOMElements($, index) {
    this.$item          = $('#toggl_item_' + index);
    this.$time          = $('#toggle_time_' + index);
    this.$title         = $('#toggl_title_' + index);
    this.$action        = $('#toggl_action_' + index);
    this.$remove        = $('#toggl_remove_' + index);
    this.$archive       = $('#toggl_archive_' + index);
    this.$edit          = $('#toggl_edit_' + index);
    this.$play          = $('#toggl_start_' + index);
    this.$cancel        = $('#txt_change_cancel_' + index);
    this.$save          = $('#txt_save_' + index);
    this.$text          = $('#toggl_txt_' + index);
    this.$textarea      = $('#toggl_title_edit_' + index);
}

function App($, _$, xmsgbox, timers, fs) {
    /* the Array of DOM elements of each timer */
    var timer_DOM_elements 		= [];
    var $items          		= $('toggl_items');
    var $add_item       		= $('toggl_add_item');
    var $add_title      		= $('toogl_input_title');   
    var $close_toggl    		= $('toggl_close');
    var new_item_html   		= $('toggl_empty_item').html();
    var $download_timers    		= $('download_timers');
    /* close app window */
    $close_toggl.on('click', function () {
        window.close();
    });
    
    $download_timers.on('click', function () {
        var csv = "Title, Status, Time \n";
        for (var key in timers) {
            csv += timers[key].title + ','+ (timers[key].status === 1 ? 'Playing' : 'Stopped') + ',' + convertSeconds(timers[key].time) + "\n";
        }
        csv = csv.replace(/(<([^>]+)>)/ig, "");
        console.log('csv: ', csv);
        fs.writeToFILE('grogotime.csv', csv);
        fs.readFromFILE('grogotime.csv', function(file_url) {
            $download_timers.attr('href', file_url).attr('download', 'grogotime_1.csv');
        });
    });
    /* add new item in app (an item is called a timer)*/
    $add_item.on('click', function (e)
        {
            var index = parseInt(_$.array.lastIndex(timers)) + 1;
            var title = $add_title.val();
            var tpl = Template(new_item_html, {'index' : index, 'title' : title, 'time' : ''});
            
            $items.append(tpl);
            timers[index] = new Timer({'index': index, 'title' : title, 'last_time' : 0, 'time' : 0, 'status' : 0});
            bindTimersActions();
            chrome.extension.sendMessage('', {'action': 'store', 'timers' : timers});
            
            e.preventDefault();
        }
    );
    
    /* on init append timers to the apps DOM element */
    for(var index in timers) {
        var timer = timers[index] = new Timer(timers[index]),
            tpl = Template(new_item_html, {'index' : index, 'title' : timer.title, 'time' : timer.time > 0 ? convertSeconds(timer.time) : ''});
        
		$items.append(tpl);
    }
    
    /* bind actions to the timer DOM elements */
    bindTimersActions();
    
    /* update time for timers that are not playing (timer.status == 1) */
    var cycle = setInterval(loopTimers, '1000'); 
    
    function bindTimersActions() {
        for(var index in timers) {
            var timer = timers[index];
            var DOM_elements = timer_DOM_elements[index] = new _timerDOMElements($, index);
            
            
            DOM_elements.$edit.on('click', function (e) 
                {
                    this.toggle(
                        function () {
                            var DOM_elements = timer_DOM_elements[this.getNo()];
                            
                            DOM_elements.$title.hide();
                            DOM_elements.$text.show();
                            DOM_elements.$edit.class('icon-save');
                        },
                        function () {
                            var DOM_elements = timer_DOM_elements[this.getNo()];
                            DOM_elements.$title.show();
                            DOM_elements.$text.hide();
                            DOM_elements.$edit.class('icon-edit');
                            DOM_elements.$title.html(DOM_elements.$textarea.val());
                            timers[this.getNo()].title = DOM_elements.$title.html();
                            
                            chrome.extension.sendMessage('', {'action': 'store', 'timers' : timers});
                        }
                    );
                    
                e.preventDefault();
                }
            );
            
            DOM_elements.$save.on('click', function () {
                var DOM_elements = timer_DOM_elements[this.getNo()];
                DOM_elements.$edit.trigger('click');
            });
            
            DOM_elements.$cancel.on('click', function (e)
                {
                    var DOM_elements = timer_DOM_elements[this.getNo()];
                    
                    DOM_elements.$title.show();
                    DOM_elements.$textarea.val(DOM_elements.$title.html());
                    DOM_elements.$text.hide();
                    DOM_elements.$edit.class('icon-edit');
                    DOM_elements.$edit.attr('toggle', '');
                    
                    e.preventDefault();
                }
            );
            
            DOM_elements.$play.on('click', function (e)
                {
                    var timer = timers[this.getNo()],
                        DOM_elements = timer_DOM_elements[this.getNo()]
                        ;
                     
                    if(timer.status === 1) {
                        DOM_elements.$play.class('icon-play');
                        DOM_elements.$play.attr('title', chrome.i18n.getMessage('startMSG'));
                        timer.pause();
                    } else {
                        DOM_elements.$play.class('icon-pause');
                        DOM_elements.$play.attr('title', chrome.i18n.getMessage('pauseMSG'));
                        timer.play();
                    }
                    
                    chrome.extension.sendMessage('', {'action': 'store', 'timers' : timers});
                  
                  e.preventDefault();
                }
            );
            
            DOM_elements.$remove.on('click', function (e)
                {
                    xmsgbox.show('Are you sure ?', function (index) {
                        var index = index;

                        return function () {
                            delete timers[index];
                            timer_DOM_elements[index].$item.remove();
                            
                            chrome.extension.sendMessage('', {'action': 'store', 'timers' : timers});
                        };
                    }(this.getNo()));

                    e.preventDefault();
                }
            );
            
            if (timer.status ===  1) {
                timer.status = 0;
                DOM_elements.$play.trigger('click');
            }
        }
    }
    
    /* function that is called every second */
    function loopTimers() {
        for(var index in timers) {
            if (timers[index] && timers[index].status  === 1) {
                timers[index].time +=1;
                timer_DOM_elements[index].$time.html(convertSeconds(timers[index].time));
            }
        }
    }
} 

/* connect to the background script */
var port = chrome.extension.connect({name: "togglPort"});

/* send message to bg script to retrieve the saved timers from the local storage */
chrome.extension.sendMessage('', {action: 'collect'});

/* listen to messages from bg script */
chrome.extension.onMessage.addListener( function(msg)
    {
        if (msg.action === 'init') {
            /* on receiving the init action the app starts */
            App($, _$, new xmsgbox(), msg.data['timers'], new FS());
        } else if (msg.action === 'debug') {
            console.log('BG debug', msg);
        }
    }
);