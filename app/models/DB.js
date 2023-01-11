"use strict"

module.exports = class DB {
    static SORT_ASC     = "ASC";
    static SORT_DESC    = "DESC";
    
    static fieldCheck(val) {
        if (val == null) return false
        else if (typeof val == Number) {
            if (val > 0) return true;
        }
        else if (typeof val == Object) {
            return false
        }
        else {
            if (val.length) return true
        }
        return false
    }
}
