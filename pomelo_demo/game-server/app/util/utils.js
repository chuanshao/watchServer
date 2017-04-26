/**
 * Created by DELL on 2017/4/19.
 */
var utils = module.exports;
/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
    if(!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

utils.size = function(obj) {
    if(!obj) {
        return 0;
    }

    var size = 0;
    for(var f in obj) {
        if(obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};