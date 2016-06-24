'use strict';

(function ($, namespace) {
    // dependency
    var notesController = namespace.notesController;
    var sortFilterRepository = namespace.sortFilterRepository;

    // TODO: Documentation

    var privatePerformReload = function () {
        var sortConfiguration = sortFilterRepository.getSort();
        var filterConfiguration = sortFilterRepository.getFilter();

        notesController.reloadNotes(sortConfiguration, filterConfiguration);
    };

    var privatePerformSortButtonClick = function (event) {
        var sortConfiguration = sortFilterRepository.getSort();
        var sortAttribute = event.target.getAttribute('data-sort-name');
        var buttonName = event.target.textContent;

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
            event.target.className = 'sort-button sort-active sort-asc';
        }

        // all others: reset
        $('.sort-button').not(event.target).attr('class', 'sort-button sort-inactive sort-asc');

        // save state
        sortFilterRepository.setSort(sortConfiguration);

        // trigger new search
        privatePerformReload();
    };


    var privatePerformFilterButtonClick = function (event) {
        var buttonName = event.target.textContent;

        if (activFilterButton.name === buttonName) {
            activFilterButton.name = null;
            event.target.className = 'filter-button filter-inactive';
        } else {
            activFilterButton.name = buttonName;
            event.target.className = 'filter-button filter-active';
        }
        $('.filter-button').not(event.target).attr('class', 'filter-button filter-inactive');
        privateRenderData();
    };

    var privateRegisterEvents = function () {
        $('.sort-button').unbind('click').on('click', function (event) {
            privatePerformSortButtonClick(event);
        });

        $('.filter-button').unbind('click').on('click', function (event) {
            privatePerformFilterButtonClick(event);
        });
    };


    namespace.sortFilterController = {

    }
    

})(jQuery, window.notesnamespace);