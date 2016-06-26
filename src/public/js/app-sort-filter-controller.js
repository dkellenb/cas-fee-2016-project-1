'use strict';

(function ($, namespace) {
    // dependency
    var notesController = namespace.notesController;
    var sortFilterRepository = namespace.sortFilterRepository;

    //Sort Direction Enum
    const SortDirection = {
        ASC: 'asc',
        DESC: 'desc',
        NONE: 'none'
    };

    // TODO: Documentation

    var privatePerformSortButtonClick = function (event) {
        var sortConfiguration = sortFilterRepository.getSort();
        var target = event.target;
        var sortAttribute = target.getAttribute('data-sort-name');

        // If the current sort attribute is defined
        if (sortConfiguration.attribute === sortAttribute) {
            if (sortConfiguration.direction === SortDirection.ASC) {
                sortConfiguration.direction = SortDirection.DESC;
                target.className = 'sort-button sort-active sort-desc';
            } else if (sortConfiguration.direction === SortDirection.DESC) {
                sortConfiguration.direction = SortDirection.NONE;
                target.className = 'sort-button sort-inactive sort-asc';
            } else {
                sortConfiguration.direction = SortDirection.ASC;
                target.className = 'sort-button sort-active sort-asc';
            }
        } else {
            sortConfiguration.direction = SortDirection.ASC;
            sortConfiguration.attribute = sortAttribute;
            target.className = 'sort-button sort-active sort-asc';
        }

        // all others: reset
        $('.sort-button').not(target).attr('class', 'sort-button sort-inactive sort-asc');

        // save state
        sortFilterRepository.setSort(sortConfiguration);

        // trigger new search
        notesController.reloadNotes();
    };


    var privatePerformFilterButtonClick = function (event) {
        var filterConfiguration = sortFilterRepository.getFilter();
        var target = event.target;

        var filterAttribute = target.getAttribute('data-filter-name');

        // If the current sort attribute is defined
        if (filterConfiguration.attribute === filterAttribute) {
            delete filterConfiguration.attribute;
            target.className = 'filter-button filter-inactive';
        } else {
            filterConfiguration.attribute = filterAttribute;
            target.className = 'filter-button filter-active';
        }

        // all others: reset
        $('.filter-button').not(target).attr('class', 'filter-button filter-inactive');

        // save state
        sortFilterRepository.setFilter(filterConfiguration);

        // trigger new search
        notesController.reloadNotes();
    };

    var privateRegisterEvents = function () {
        $('.sort-button').unbind('click').on('click', function (event) {
            privatePerformSortButtonClick(event);
        });

        $('.filter-button').unbind('click').on('click', function (event) {
            privatePerformFilterButtonClick(event);
        });
    };

    var privateInitializeWithPersistedState = function () {
        var sortConfiguration = sortFilterRepository.getSort();
        $('.sort-button').each(function (index, element) {
            privateUpdateSortButtonClass(element, ($(element).data('sortName') == sortConfiguration.attribute), sortConfiguration.direction);
        });
        var filterConfiguration = sortFilterRepository.getFilter();
        $('.filter-button').each(function (index, element) {
            privateUpdateFilterButtonClass(element, $(element).data('filterName') == filterConfiguration.attribute);
        });
    };

    /**
     * update the classAttribute on a sortButton element
     * @param buttonElement element of sortButton
     * @param active
     * @param sortDirection
     */
    var privateUpdateSortButtonClass = function (buttonElement, active, sortDirection) {
        var classString = 'sort-button sort-' + (active ? 'active' : 'inactive');
        if (sortDirection !== null && sortDirection !== undefined) {
            classString = classString + ' sort-' + sortDirection;
        }
        buttonElement.className = classString;
    };

    /**
     * update the classAttribute on a filterButton element
     * @param buttonElement element of filterButton
     * @param active
     */
    var privateUpdateFilterButtonClass = function (buttonElement, active) {
        buttonElement.className = 'filter-button filter-' + (active ? 'active' : 'inactive');
    };

    privateRegisterEvents();
    privateInitializeWithPersistedState();

})(jQuery, window.notesnamespace);