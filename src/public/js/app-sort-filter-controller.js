'use strict';

(function ($, namespace) {
    // dependency
    var notesController = namespace.notesController;
    var sortFilterRepository = namespace.sortFilterRepository;

    // TODO: Documentation

    var privatePerformSortButtonClick = function (event) {
        var sortConfiguration = sortFilterRepository.getSort();
        var sortAttribute = event.target.getAttribute('data-sort-name');

        // If the current sort attribute is defined
        if (sortConfiguration.attribute === sortAttribute) {
            if (sortConfiguration.direction === 'asc') {
                sortConfiguration.direction = 'desc';
                event.target.className = 'sort-button sort-active sort-desc';
            } else if (sortConfiguration.direction === 'desc') {
                sortConfiguration.direction = 'none';
                event.target.className = 'sort-button sort-inactive';
            } else {
                sortConfiguration.direction = 'asc';
                event.target.className = 'sort-button sort-active sort-asc';
            }
        } else {
            sortConfiguration.direction = 'asc';
            sortConfiguration.attribute = sortAttribute;
            event.target.className = 'sort-button sort-active sort-asc';
        }

        // all others: reset
        $('.sort-button').not(event.target).attr('class', 'sort-button sort-inactive sort-asc');

        // save state
        sortFilterRepository.setSort(sortConfiguration);

        // trigger new search
        notesController.reloadNotes();
    };


    var privatePerformFilterButtonClick = function (event) {
        var filterConfiguration = sortFilterRepository.getFilter();
        var filterAttribute = event.target.getAttribute('data-filter-name');

        // If the current sort attribute is defined
        if (filterConfiguration.attribute === filterAttribute) {
            filterConfiguration.attribute = '';
            event.target.className = 'filter-button filter-inactive';
        } else {
            filterConfiguration.attribute = filterAttribute;
            event.target.className = 'filter-button filter-active';
        }

        // all others: reset
        $('.filter-button').not(event.target).attr('class', 'filter-button filter-inactive');

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

    privateRegisterEvents();

})(jQuery, window.notesnamespace);