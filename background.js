var chromelocalStorage = chrome.storage.local;
var timers = new Array();
var archive = new Array();
var STORAGE_SPACE = 5 * 1024 * 1024;//5 MB
var STORAGE_DATA = {timers : [], timers_archive : []};

function saveToStorage() {
    var newTimers = new Array();
    var newArchive = new Array();
    var newIndex = 0;

    for(var index in timers) {
        if (timers[index] !== null) {
            newTimers[newIndex] = timers[index];
            timers[index].index = newIndex++;
        }
    }
    newIndex = 0;
    for(var index in archive) {
        if (archive[index] !== null) {
            newArchive[newIndex] = archive[index];
            archive[index].index = newIndex++;
        }
    }
    
    chromelocalStorage.set({timers : {active : newTimers, archived : newArchive}});
    //chromelocalStorage.set({timers : {active : [], archived : []}});
}

chrome.extension.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function () { 
        saveToStorage(); 
    });
});

chrome.extension.onMessage.addListener(function(msg) {
	if (msg.action === 'store') {
		timers = msg.timers;     
        //chrome.extension.sendMessage('', {'action' : 'debug', 'data' : timers});
	} else if (msg.action === 'collect') {
            chromelocalStorage.get('timers', function (saved) {
            //chromelocalStorage.set({timers : {active : [], archived : []}});
            if (typeof saved.timers === 'object') {
                var savedTimers = saved.timers;
                STORAGE_DATA['timers'] = typeof savedTimers.active !== 'undefined' ? savedTimers.active : new Array();
                STORAGE_DATA['timers_archive'] = typeof savedTimers.archived !== 'undefined' ? savedTimers.archived : new Array();
            }

            chrome.extension.sendMessage('', {'action' : 'init', 'data' : STORAGE_DATA});
            });
	}
});
