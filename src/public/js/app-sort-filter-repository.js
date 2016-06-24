'use strict';

(function (namespace) {

    const LOCAL_STORAGE_FILTER = 'notes-filter';
    const LOCAL_STORAGE_SORT = 'notes-sort';
    
    var localStorageUtil = namespace.localStorageUtil;

    // TODO: Add documentation

    var publicSetFilter = function(updatedFilter) {
        localStorageUtil.save(LOCAL_STORAGE_FILTER, updatedFilter);
    };

    var publicGetFilter = function() {
        return localStorageUtil.load(LOCAL_STORAGE_FILTER);
    };

    var publicSetSort = function (updatedSort) {
        localStorageUtil.save(LOCAL_STORAGE_SORT, updatedSort);
    };

    var publicGetSort = function () {
        return localStorageUtil.load(LOCAL_STORAGE_SORT);
    };

    namespace.sortFilterRepository = {
      setFilter: publicSetFilter,
      getFilter: publicGetFilter,
      setSort: publicSetSort,
      getSort: publicGetSort
    };

})(window.notesnamespace);