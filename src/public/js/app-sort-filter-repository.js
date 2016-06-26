'use strict';

(function (namespace) {

    const LOCAL_STORAGE_FILTER = 'notes-filter';
    const LOCAL_STORAGE_SORT = 'notes-sort';
    
    var localStorageUtil = namespace.localStorageUtil;

    /**
     * Save the current filter to local storage.
     *
     * @param updatedFilter the filter
     */
    var publicSetFilter = function(updatedFilter) {
        localStorageUtil.save(LOCAL_STORAGE_FILTER, updatedFilter);
    };

    /**
     * Get the filter from the local storage.
     */
    var publicGetFilter = function() {
        return localStorageUtil.load(LOCAL_STORAGE_FILTER);
    };

    /**
     * Set the sort from the session storage.
     *
     * @param updatedSort the updated sort definition
     */
    var publicSetSort = function (updatedSort) {
        localStorageUtil.save(LOCAL_STORAGE_SORT, updatedSort);
    };

    /**
     * Get the sort condition from the local storage.
     */
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