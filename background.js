var chromelocalStorage = chrome.storage.sync;
var timers = new Array();
var archive = new Array();
var INIT = false;
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
/*  this is a fail safe action. If somehow the timers do not get saved at edit/delete etc
    when the connection stops between the bg script and the main script
    the timers will be saved to localstorage
 */
chrome.extension.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function () {
        /* if the timers were gathered from the local storage */
        if (INIT) {
            saveToStorage();
        }
    });
});

chrome.extension.onMessage.addListener(function(msg) {
	if (msg.action === 'store') {
		timers = msg.timers;   
		saveToStorage();
        //chrome.extension.sendMessage('', {'action' : 'debug', 'data' : timers});
	} else if (msg.action === 'collect') {
            chromelocalStorage.get('timers', function (saved) {
            //chromelocalStorage.set({timers : {active : [], archived : []}});
            if (typeof saved.timers === 'object') {
                var savedTimers = saved.timers;
                STORAGE_DATA['timers'] = typeof savedTimers.active !== 'undefined' ? savedTimers.active : new Array();
                STORAGE_DATA['timers_archive'] = typeof savedTimers.archived !== 'undefined' ? savedTimers.archived : new Array();
            }
            INIT = true;
            chrome.extension.sendMessage('', {'action' : 'init', 'data' : STORAGE_DATA});
            });
	}
});
