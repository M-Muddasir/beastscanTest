# BeastScan Upvote Challenge

A dynamic voting widget built with HTML5, CSS3, and vanilla JavaScript that allows users to upvote/downvote ideas, edit content, and more.

## Features

- **Dynamic Card Generation**: Cards are generated based on data fetched from the API endpoint
- **Interactive Voting System**: Users can upvote or downvote ideas
- **Editable Content**: Users can edit card content through a modal dialog
- **Data Persistence**: All changes persist after page reload using localStorage
- **Drag and Drop**: Cards can be reordered via drag and drop
- **Sorting**: Cards can be sorted by votes or default order
- **Reset Functionality**: Reset to original data from the API
- **CRUD Operations**: Add, edit, and delete ideas
- **Widget Implementation**: Can be embedded as a widget on any website
- **Responsive Design**: Fully responsive UI for all device sizes

## Project Structure

```
beastscanTest/
├── css/
│   └── styles.css            # Main stylesheet
├── js/
│   ├── components/
│   │   ├── Card.js           # Card component for rendering individual cards
│   │   ├── CardList.js       # Manages collection of cards and interactions
│   │   └── Modal.js          # Handles modal functionality for editing/adding
│   └── app.js                # Main application file
├── index.html                # Main HTML file
└── README.md                 # Project documentation
```

## Component Architecture

The project follows a component-based functional approach:

- **Card Component**: Handles rendering and interactions for individual cards
- **CardList Component**: Manages the collection of cards, sorting, and reordering
- **Modal Component**: Handles the display and functionality of edit and add modals
- **App**: Coordinates components and handles application state

## API Integration

The application fetches data from the BeastScan API endpoint:
```
https://my.beastscan.com/test-kit
```

## Widget Implementation

To embed the widget on any website, use the following code:

```html
<!-- Include the required CSS and JS files -->
<link rel="stylesheet" href="path/to/styles.css">
<script src="path/to/Card.js"></script>
<script src="path/to/Modal.js"></script>
<script src="path/to/CardList.js"></script>
<script src="path/to/app.js"></script>

<!-- Create a container for the widget -->
<div id="beastscan-container"></div>

<!-- Initialize the widget -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    BeastScanApp.init('beastscan-container', {
      title: 'Custom Widget Title'
    });
  });
</script>
```

## Local Development

To run the project locally:

1. Clone the repository
2. Set up a local server to serve the files (to avoid CORS issues)
3. Open the index.html file through the local server

## Browser Compatibility

The application is compatible with modern browsers that support ES6 features:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
