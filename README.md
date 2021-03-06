# CAS FE - Project 1 of Group 'dkellenb' and 'bruede'

This repository contains the project work of the two students [Daniel Kellenberger](https://github.com/dkellenb) and [Benjamin Rüde](https://github.com/bruede).

## Installation
- git clone https://github.com/dkellenb/cas-fee-2016-project-1.git
- cd cas-fee-2016-project-1
- npm install
- npm start
- access the application (http://0.0.0.0:3001/)

## Documentation

### Supported Browsers
* Desktop
  * Chrome
  * Firefox
* Mobile
  * Android with Chrome browser
  * iOS

### Supported features
* __Easy to use note application__
  * Easy to start with your first note. You simply can't miss the big button at your screen for adding your first note
  * Application will know if there are no notes and will show you a big plus-sign for adding a note
  * There is no annoying input validation. You can enter what you like, the system can handle it
  * You have a fast feedback if you hit the save button and you can switch back to edit in no time
* __All functions you wish__
  * Create note
  * Edit a note
  * Revert a note to his stored state
  * Delete a note
  * Give notes dates until they have to be finished
  * Mark notes as finished
  * Give notes a importance value between 1-5
* __Filter and sort your notes for better overview__
  * Sort by create date
  * Sort by importance
  * Sort by date until job has to be done
  * Show again finished notes
* __Work on the same set with your friend at the same time__
  * Sharing new notes (new notes appear at the end)
  * Sharing every edit and update
  * Deleted notes by your friend will be removed immediately also on your screen
* __Works with IOs and Android Browsers on your mobile__
  * You can even use all the share functions with your friends on your mobile device
* __Change color to your favorite style__
  * Your selection get stored in the LocalStorage and will be persisted between visits
  * Choose between 4 color sets
* __Multi edit and new notes is possible__
  * You can have multiple notes in edit mode: They will stay in edit mode even if you hit the sort or filter buttons
  * You can start with multiple new notes: They will stay at any time at the top of the list and will not be affected by sorting oder filtering

### Technical features
* The Application uses a REST-API on a node.js server for storing notes on a nedb.
  * It is possible to send your web socket id through the rest interface. The web socket event will contain your id.
* Events for create, update and delete of notes are shared by a web socket with the id of the note and the socketId if present. The client can then decide what he want to to with it. (Future feature)
* For the color switching CSS properties are used (-> No big dom changes needed or complicate selectors).
* Handelbars is used for doing all the template rendering.
* There is a jquery-extension which allows the ajax-json-parser to identify date objects and convert them back to date objects instead of strings.
* UUID is used for creating unique IDs for all notes
* Everything in the application is set to the application namespace, there are no global definitions.
* Responsive layout based on flex structure

### REST Api

####Methods
| Method             | CMD    | Description                      |
|--------------------|--------|----------------------------------|
| /rest/notes        | GET    | Returns all persisted notes      |
| /rest/notes        | POST   | Adds a new note                  |
| /rest/notes/model/ | GET    | Gets a template model            |
| /rest/notes/:id    | GET    | Returns a note with the given id |
| /rest/notes/:id    | PUT    | Updates a note by the given id   |
| /rest/notes/:id    | DELETE | Deletes a note by the given id   |

####Special Headers####
It is possible to send the header 'X-Note-Socket-ID' with a request. If you do the event created by the websocket because of your request will contain your socket id an can be used on the client side to identify your own events.
