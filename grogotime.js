var port = chrome.extension.connect({name: "togglPort"});
var timers = [];
var archive = [];

var xmsgbox = new xmsgbox();
chrome.extension.sendMessage('', {to: 'initTimers'});

chrome.extension.onMessage.addListener(function(msg) {
    if (msg.to == 'toggl') {
        console.log('Message back', msg.data);
    } else if (msg.to == 'initToggl') {
        timers = msg.data.timers;
        archive = msg.data.timers_archive;
        init();
    } else if (msg.to == 'togglError') {
        console.error(msg.data);
    }
});

function init() {

var $items = $('toggl_items');
var $addItem = $('toggl_add_item');
var $addTitle = $('toogl_input_title');
var $closeToggl = $('toggl_close');
var newItemHTML = $('toggl_empty_item').html();
var cycle = '';

$addItem.on('click', function (e) {
  addTimer();
  initActions();
  e.preventDefault();
});
$closeToggl.on('click', function (e) {
    console.log('Close it');
    window.close();
});

function initTimers() {
    for(var index in timers) { 
        if (timers[index]) {  
            reloadTimer(index);
        }
    }
  
    chrome.extension.sendMessage('', {to: 'bgTimers', data: timers});
    initActions();
}

function addTimer() {
    var index = parseInt(_$.array.lastIndex(timers)) + 1;
    var title = $addTitle.val(); 
    timers[index] = {status: 0, time: 0, index: index, title: title, lastTime: 0};

    $items.append(newItemHTML.replace(/<!--/, '<li')
                             .replace(/-->/, '</li>')
                             .replace(/%index%/g, index)
                             .replace(/%title%/, title))
                             ;
    chrome.extension.sendMessage('', {to: 'bgTimer', data: {index : index, timer : timers[index]}});
}

function reloadTimer(index) { 
    var time = new Date().getTime();// + 220000000;
	if (timers[index].status == 1) {
		timers[index].time += Math.floor((time - timers[index].lastTime) / 1000);
		timers[index].lastTime = time;
	}
    $items.append(newItemHTML.replace(/<!--/, '<li')
                                 .replace(/-->/, '</li>')
                                 .replace(/%index%/g, index)
                                 .replace(/%title%/, timers[index].title))
                                 ;
    var $ele = $('toggl_action_' + index);
    if (timers[index].status == 1) {
		$ele.fkid().class('icon-pause');
		$ele.fkid().attr('title', chrome.i18n.getMessage('pauseMSG'));
        //$ele.firstChild.innerHTML = chrome.i18n.getMessage('pauseMSG');
    }
    
    if (timers[index].time) {
        $('toggle_time_' + index).html(convertSeconds(timers[index].time));
    } 
}

function initActions() { 
  for(var index in timers) {
    if (!timers[index]) continue;
    var $ele = $('toggl_action_' + index);
    if ($ele) {
		var $play = $ele.fkid();
		var $edit = $ele.fkid().next();
		var $delete = $ele.fkid().next().next();
		var $archive = $ele.lkid();
		
		$edit.attr('href', '#' + index);
		$edit.on('click', function(e) {
		var $btn = this;
		var index = this.attr('href').replace(/#/g, '');
		var $title = $('toggl_title_' + index);
		var $item = $('toggl_item_' + index);
		var closeTextareaFunc = function (save) {
			var val = $('toggl_title_edit_' + index).val();
			$title.html((save) ? val : timers[index].title);
			$title.removeClass('edit_text');
			$btn.class('icon-edit');
			$btn.attr('title', chrome.i18n.getMessage('editMSG'));
			return timers[index].title != $title.html() ? timers[index].title = $title.html() : false;
		}
		if ($btn.hasClass('icon-edit')) {
			var val = $title.html();
			$title.html('<textarea id="toggl_title_edit_' + index + '">' + val + '</textarea>');
			$title.append('<a style="margin:2px" href="#' + index + '" title="Save" class="icon-save" id="txt_save_' + index  + '"></a><a style="float:right;margin:2px" href="' + index + '" id="txt_change_cancel_' + index + '" class="icon-chevron-up" title="Cancel"></a>');
			
			var $txtSave = $('txt_save_' + index);
			var $txtChangeCancel = $('txt_change_cancel_' + index);
			
			
			$txtSave.on('click', function(e) {
				if (closeTextareaFunc(true)) {	
					chrome.extension.sendMessage('', {to: 'bgTimer', data: {index : index, timer : timers[index]}});
				}
				e.preventDefault();
			});
			
			$txtChangeCancel.on('click', function(e) {
				closeTextareaFunc(false);							
				e.preventDefault();
			});
			
			$title.addClass('edit_text');
			$btn.class('icon-save');
			$btn.attr('title', chrome.i18n.getMessage('saveMSG'));
		} else {
			if (closeTextareaFunc(true)) {		
				chrome.extension.sendMessage('', {to: 'bgTimer', data: {index : index, timer : timers[index]}});
			}
			
		}
		e.preventDefault();
      });
	  
     
      $delete.attr('href', '#' + index);
      //console.log('Delete', $delete);
      $delete.on('click', function(e) {
		var index = this.attr('href').replace(/#/g, '');
        
		xmsgbox.show('Are you sure ?', function (index, $obj) {
            var index = index;
            var $obj = $obj;
                
			return function () {
                delete timers[index];	
                $obj.parent().parent().remove();
                chrome.extension.sendMessage('', {to: 'bgTimer', data: {index : index, timer : timers[index]}});
			}; 
		}(index, this));
		
        e.preventDefault();
      });
	  
      $archive.attr('href', '#' + index);
      $archive.on('click', function(e) {
			var index = this.attr('href').replace(/#/g, '');
			this.parent().parent().remove();
			archive[archive.length] = timers[index];
			
			chrome.extension.sendMessage('', {to: 'bgArchive', data: {index : index, timer : timers[index]}});
			delete timers[index];
			
			e.preventDefault();
      });
	  
      $play.attr('href', '#' + index);                              
      $play.on('click', function(e) {
        var $btn = this;
        var index = $btn.attr('href').replace(/#/g, '');
        if(timers[index].status == 1) {
			$btn.class('icon-play');
			$btn.attr('title', chrome.i18n.getMessage('startMSG'));
          timers[index].status = 0;
          timers[index].lastTime = 0;
        } else {      
          $btn.class('icon-pause');
          $btn.attr('title', chrome.i18n.getMessage('pauseMSG'));
          timers[index].status = 1; 
          timers[index].lastTime = new Date().getTime();
        }
        
        chrome.extension.sendMessage('', {to: 'bgTimer', data: {index : index, timer : timers[index]}});
        e.preventDefault();
      });
    }    
  }
}

function loopTimers() {
	for(var index in timers) {
		if(timers[index] && timers[index].status  == 1) {
			timers[index].time +=1;
			$('toggle_time_' + index).html(convertSeconds(timers[index].time));
		}
	}
}

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

if (timers.length > 0) {
  initTimers();  
}

cycle = setInterval(loopTimers, '1000'); 

}