'use strict';

(function ($, namespace) {
    // dependency
    var notesController = namespace.notesController;
    var sortFilterRepository = namespace.sortFilterRepository;

    //Sort Direction Enum
    const SortDirection = {
        ASC: 'asc',
        DESC: 'desc'
    };

    /**
     * Performe Event if sortButton is clicked
     * - update sortConfiguration
     * - trigger updateButtons (gui)
     * - trigger new Search
     * @param event
     */
    var privatePerformSortButtonClick = function (event) {
        //update sortConfiguration
        var sortConfiguration = sortFilterRepository.getSort();
        var target = event.target;
        var sortAttribute = target.getAttribute('data-sort-name');

        if (sortConfiguration.attribute !== sortAttribute) {
            //first Click on Button (activate)
            sortConfiguration.attribute = sortAttribute;
            sortConfiguration.direction = SortDirection.ASC;
        } else {
            if (sortConfiguration.direction === SortDirection.ASC) {
                //second Click on Button (change direction)
                sortConfiguration.direction = SortDirection.DESC;
            } else {
                // last click on Button (deactivate)
                sortConfiguration.attribute = undefined;
                sortConfiguration.direction = SortDirection.ASC;
            }
        }
        sortFilterRepository.setSort(sortConfiguration);

        //trigger updateButton
        privateUpdateSortButtonStates(sortConfiguration);

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

    /**
     * Function for register all Events for sort- and filterButtons.
     */
    var privateRegisterEvents = function () {
        $('.sort-button').unbind('click').on('click', function (event) {
            privatePerformSortButtonClick(event);
        });

        $('.filter-button').unbind('click').on('click', function (event) {
            privatePerformFilterButtonClick(event);
        });
    };

    /**
     * Update state of all sortButtons with given sortCOnfiguration.
     * @param sortConfiguration
     */
    var privateUpdateSortButtonStates = function (sortConfiguration) {
        $('.sort-button').each(function (index, element) {
            privateUpdateSortButtonClass(element, ($(element).data('sortName') == sortConfiguration.attribute), sortConfiguration.direction);
        });
    };

    /**
     *  Update state of all filterButtons with given filterConfiguration.
     * @param filterConfiguration
     */
    var privateUpdateFilterButtonStates = function (filterConfiguration) {
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
        if (sortDirection !== null && sortDirection !== undefined && active) {
            classString = classString + ' sort-' + sortDirection;
        }else{
            classString = classString + ' sort-' + SortDirection.ASC;
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

    /**
     * Load Button with correct state from LocalRepository and register all Events for the Buttons.
     */
    var privateInitButtons = function () {
        privateUpdateSortButtonStates(sortFilterRepository.getSort());
        privateUpdateFilterButtonStates(sortFilterRepository.getFilter());
        privateRegisterEvents();
    };

    privateInitButtons();

})(jQuery, window.notesnamespace);