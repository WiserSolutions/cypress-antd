# cypress-antd

Helpers for interacting with Ant Design components in Cypress tests.


## Use

Import the provided helpers directly:

```javascript
import { getButton, shouldHaveTooltip } from '@hon2a/cypress-antd'

// note that "child command" (Cypress terminology) helpers are curried to be used inside `then`
getButton('Cool Button').then(shouldHaveTooltip('The coolness of this button knows no bounds.'))
```

or register them automatically with Cypress as custom commands:

```javascript
import '@hon2a/cypress-antd/lib/register'

// note that "child commands" are registered properly to automatically consume the yielded subject
cy.getButton('Uncool Button').shouldHaveTooltip('This button is so very sad.')
```

_Documentation of individual commands is TBD. For now, the helper names and contracts should be self-explanatory._ 

## Development

### Install

Install dependencies using:

```sh
npm install
```

### Develop

After you modify sources, run the following (or set up your IDE to do it for you):

- format the code using `npm run format`
- lint it using `npm run lint`
- test it using `npm test`

and fix the errors, if there are any.

### Publish

Publishing is done in two steps:

1. Create a new version tag and push it to the repository:
    ```sh
    npm version <patch|minor|major>
    git push --follow-tags
    ```
1. Build and publish the new version as a npm package:
    ```sh
    npm publish --access public
    ``` 
