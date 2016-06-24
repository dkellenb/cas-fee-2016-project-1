# CAS FE - Project 1 of Group 'dkellenb' and 'bruede'

This repository contains the project work of the two students [Daniel Kellenberger](https://github.com/dkellenb) and [Benjamin Rüde](https://github.com/bruede).

## Installation
- git clone https://github.com/dkellenb/cas-fee-2016-project-1.git
- cd cas-fee-2016-project-1
- npm install
- npm start

## Documentation
### Supported features

- Create/Edit note inline with the others
- Change color to your favorite style
- Work on the same set with your friend at the same time

### REST Api

| Method             | CMD    | Description                      |
|--------------------|--------|----------------------------------|
| /rest/notes        | GET    | Returns all persisted notes      |
| /rest/notes        | POST   | Adds a new note                  |
| /rest/notes/model/ | GET    | Gets a template model            |
| /rest/notes/:id    | GET    | Returns a note with the given id |
| /rest/notes/:id    | PUT    | Updates a note by the given id   |
| /rest/notes/:id    | DELETE | Deletes a note by the given id   |

