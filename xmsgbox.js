function xmsgbox() {
    
    this.msgBoxCallback = function () {};

    this.show = function (msgText, callback) {
        $('xmsgbox').show();
        msgBoxCallback = callback;
        $('xmsgbox_txt').html(msgText);
    }
    this.init = function () { 
        var $msg = $('xmsgbox');
        var $ansYes = $('xmsgbox_answer_yes');
        var $ansNo = $('xmsgbox_answer_no');
        
        $ansYes.on('click', function(e) {
            msgBoxCallback();
            $msg.hide();
            e.preventDefault();
        });
            
        $ansNo.on('click', function(e) {
            $msg.hide();
            e.preventDefault();
        });
    }
    
    this.init();
}
