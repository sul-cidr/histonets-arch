import React from "react";
import { render } from "react-dom";
import App from './app';

render(<App props={window.props}/>, document.getElementById('react-app'))
