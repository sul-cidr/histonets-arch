import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

import CollectionCreate from './components/CollectionCreate';


const App = props => (
  <div>
    <CollectionCreate {...props} />
  </div>
);

App.propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  imageFormats: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default App;

/* istanbul ignore if */
if (!module.parent) {
  render(<App {...window.props}/>, document.getElementById('react-app'))
}
