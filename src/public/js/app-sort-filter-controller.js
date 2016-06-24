'use strict';

(function ($, namespace) {
    // dependency
    var notesController = namespace.notesController;
    var sortFilterRepository = namespace.sortFilterRepository;

    // TODO: Documentation

    var privatePerformSortButtonClick = function (event) {
        var sortConfiguration = sortFilterRepository.getSort();
        var target = event.target;
        var sortAttribute = target.getAttribute('data-sort-name');

        // If the current sort attribute is defined
        if (sortConfiguration.attribute === sortAttribute) {
            if (sortConfiguration.direction === 'asc') {
                sortConfiguration.direction = 'desc';
                target.className = 'sort-button sort-active sort-desc';
            } else if (sortConfiguration.direction === 'desc') {
                sortConfiguration.direction = 'none';
                target.className = 'sort-button sort-inactive sort-asc';
            } else {
                sortConfiguration.direction = 'asc';
                target.className = 'sort-button sort-active sort-asc';
            }
        } else {
            sortConfiguration.direction = 'asc';
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
            filterConfiguration.attribute = '';
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

    var privateInitializeWithPersistedState = function() {
        var sortConfiguration = sortFilterRepository.getSort();
        $('.sort-button').each(function () {
            if ($(this).data('sortName') == sortConfiguration.attribute) {
                if (sortConfiguration.direction == 'asc') {
                    this.className = 'sort-button sort-active sort-asc';
                } else if (sortConfiguration.direction == 'desc') {
                    this.className = 'sort-button sort-active sort-desc';
                } else {
                    this.className = 'sort-button sort-inactive';
                }
            }
        });
        var filterConfiguration = sortFilterRepository.getFilter();
        $('.filter-button').each(function () {
            if ($(this).data('filterName') == filterConfiguration.attribute) {
                this.className = 'filter-button filter-active';
            } else {
                this.className = 'filter-button filter-inactive';
            }
        });
    };

    privateRegisterEvents();
    privateInitializeWithPersistedState();

})(jQuery, window.notesnamespace);