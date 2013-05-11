window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    
function FS(loadedCallback){
    var self = this;
    var initFS = function (fs) {
        this.createDIR = function (dir_name) {
            fs.root.getDirectory(dir_name, {create : true}, function () 
                {
                }
            );
        }
        
        this.writeToFILE = function (file_name, text, callbackFileWritten) {
            fs.root.getFile(file_name, {create : true}, function (file_entry) 
                {
                    file_entry.createWriter(function (writer) {
                        writer.write(new Blob([text], {type : 'plain/text'}));
                        writer.onwriteend = function (e) {
                            if (typeof callbackFileWritten === 'function') {
                                callbackFileWritten.apply(writer, [file_entry.toURL()]);
                            }
                        }
                    });
                }
            );
        }
        
        this.readFromFILE = function (file_name, callbackFileRead) {
            fs.root.getFile(file_name, {}, function (file_entry) 
                {
                    file_entry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                            if (typeof callbackFileRead === 'function') {
                                callbackFileRead.apply(reader, [file_entry.toURL()]);
                            }
                        }
                        reader.readAsText(file);
                    });
                }
            );
        }
		
        this.removeFILE = function (file_name, callbackFileRemoved) {
            fs.root.getFile(file_name, {create: false}, function (file_entry) 
                {
					file_entry.remove(function() {
						if (typeof callbackFileRemoved === 'function') {
							callbackFileRemoved.apply(file_entry, [file_name]);
						}
					});
                }
            );
        }
    }
    
    window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
        initFS.apply(self, [fs]);
        if (typeof loadedCallback === 'object') {
            loadedCallback.apply(self);
        }
    });
}


