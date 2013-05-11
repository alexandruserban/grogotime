/* function for DOM manip */
function $ (EL_ID) {
    var domEl;

    if (typeof EL_ID === 'object') {
        domEl = EL_ID;
    } else {
        domEl = document.getElementById(EL_ID.replace(/#/,''));
    }
    
    if (!domEl) {
        return 0;
    }

    return {
        DOM_EL : domEl,
        
        getNo : function () {
            if (!this.no) { 
                this.no = this.attr('id').split('_').pop();
            }                
            return this.no;
        },
        
        no: '',
        
        append : function (html, callback) {
            this.DOM_EL.innerHTML += html;
            if (callback) {
                return callback.apply(this);
            }
        },

        html : function (html) {
            if (typeof html !== 'undefined') {
                this.DOM_EL.innerHTML = html;
            } else {
                return this.DOM_EL.innerHTML;
            }

            return this;
        },

        attr : function (attr, worth) {
            //console.log('DOM_EL', arguments.callee.caller.toString());
            if (typeof worth !== 'undefined') {
                this.DOM_EL.setAttribute(attr, worth);
            } else {
                return this.DOM_EL.getAttribute(attr);
            }

            return this;
        },

        firstChild : function () {
            return $(this.DOM_EL.firstChild);
        },

        lastChild : function () {
            return $(this.DOM_EL.lastChild);
        },

        nextSibling : function () {
            return $(this.DOM_EL.nextSibling);
        },

        previousSibling : function () {
            return $(this.DOM_EL.previousSibling);
        },

        parent : function () {
            return $(this.DOM_EL.parentNode);
        },

        remove : function () {
            return this.DOM_EL.parentNode.removeChild(this.DOM_EL);
        },  

        on : function (ev, callback) {
            var self = this;
            
            this.DOM_EL.addEventListener(ev, function () {
                return callback.apply(self, arguments);
            });
        },

        show: function () {
            this.DOM_EL.style.display = 'block';
            return this;
        },

        hide: function () {
            this.DOM_EL.style.display = 'none';
            return this;
        },

        trigger : function (ev) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent(ev, true, true);
            this.DOM_EL.dispatchEvent(event);
        },

        val : function (val) {
            if (typeof val === 'undefined') {
                return this.DOM_EL.value;
            } else {
                this.DOM_EL.value = val;
            }

            return this;
        },

        fkid : function () { return this.firstChild();},

        lkid : function () { return this.lastChild();},

        next : function () { return this.nextSibling();},

        prev : function () { return this.previousSibling();},

        removeClass : function (cls) {
            if (this.hasClass(cls)) {
                if (this.DOM_EL.className === cls) {
                    this.DOM_EL.className = '';
                } else {
                    this.DOM_EL.className = this.DOM_EL.className.replace(new RegExp(cls + ' ','g'), '')
                                               .replace(new RegExp(' ' + cls,'g'), '')
                                               .replace(/[\s]+/g, ' ');
                }
            }

            return this;
        },

        class : function (cls) {
            this.DOM_EL.className = cls;
            return this;
        },

        addClass : function (cls) { return function (cls) {
            var cls = cls.replace(/[\s+]/g, '');
            if (!this.hasClass(cls)) {
                this.DOM_EL.className += (this.DOM_EL.className ? ' ' : '' ) + cls;
            }

            return this;
        }.call(this, cls);},

        hasClass : function (cls) {
            return ((this.DOM_EL.className.indexOf(cls + ' ') === -1)
                    && (this.DOM_EL.className.indexOf(' ' + cls) === -1)
                    && this.DOM_EL.className !== cls)
                    ? false : true;
        },

        noKids : function () {
            var realKids = 0;
            var kids = this.DOM_EL.childNodes.length;
            var i = 0;
            while (i < kids) {
                //console.log('DOM EL', this.DOM_EL.childNodes[i]);
                if(this.DOM_EL.childNodes[i].nodeType !== 3){
                    realKids++;
                }
                i++;
            }
            
            return realKids;
        },
        
        css: function (props) {
            if (typeof props === 'object') {
                for (var prop_name in props) {
                    this.DOM_EL.style[prop_name] = props[prop_name];
                }
            } else if (typeof props === 'string') {
                return this.DOM_EL.style[props];
            }
            
            return this;
        },
        
        getOffset : function () {
            var _x = 0;
            var _y = 0;
            var el = this.DOM_EL;
            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return { top: _y, left: _x };
        },
        
        toggle: function (func_1, func_2)    {
            var self = this;

            if (!this.attr('toggle')) {
                this.attr('toggle', '1');
                return func_1.apply(self, arguments);
            } else {
                this.attr('toggle', '');
                return func_2.apply(self, arguments);
            }
        }
    };
}
/* object for help */
var _$ = {
        array : {   lastIndex : function (arry) {
                        var key = Object.keys(arry).pop();
                        return key ? key : -1;
                }
    }
};





