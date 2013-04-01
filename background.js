var chromelocalStorage = chrome.storage.sync;
var timers = new Array();
var archive = new Array();
var STORAGE_SPACE = 5 * 1024 * 1024;//5 MB
var STORAGE_DATA = {timers : [], timers_archive : []};

function sendError(err) {
    chrome.extension.sendMessage('', {to : 'togglError', 'data' : err});
}

function saveToStorage() {
    var newTimers = new Array();
    var newArchive = new Array();
    var newIndex = 0;

    for(var index in timers) {
        if (timers[index] != null) {
            newTimers[newIndex++] = timers[index];
        }
    }
    newIndex = 0;
    for(var index in archive) {
        if (archive[index] != null) {
            newArchive[newIndex++] = archive[index];
        }
    }

    chromelocalStorage.set({timers : {active : newTimers, archived : newArchive}});
        
}

chrome.extension.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function () { 
        saveToStorage(); 
    });
  //
});

chrome.extension.onMessage.addListener(function(msg) {
	if (msg.to == 'bgTimers') {
		timers = msg.data;
		chrome.extension.sendMessage('', {to : 'toggl', 'data' : timers});
	} else if (msg.to == 'bgArchived') {
		archive = msg.data;
        saveToStorage(); 
	} else if (msg.to == 'bgTimer') {
		timers[msg.data.index] = msg.data.timer;
        saveToStorage(); 
        chrome.extension.sendMessage('', {to : 'toggl', 'data' : timers});
	} else if (msg.to == 'bgArchive') {
		archive[archive.length] = msg.data.timer;
		delete timers[msg.data.index];
        saveToStorage(); 
	} else if (msg.to == 'initTimers') {
        chromelocalStorage.get('timers', function (saved) {
           if (typeof saved.timers == 'object') {
               var savedTimers = saved.timers;
               STORAGE_DATA['timers'] = typeof savedTimers.active != 'undefined' ? savedTimers.active : new Array();
               STORAGE_DATA['timers_archive'] = typeof savedTimers.archived != 'undefined' ? savedTimers.archived : new Array();
           }

            chrome.extension.sendMessage('', {to : 'initToggl', 'data' : STORAGE_DATA});
        });
	}
	
});
