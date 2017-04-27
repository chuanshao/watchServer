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

utils.indexOf = function (arr , obj) {
    if(typeof arr=='object'&&arr.constructor==Array){
        for (var i = 0 ; i < arr.length ; i++){
            if(obj == arr[i]){
                return i;
            }
        }
    }
    return -1;
}