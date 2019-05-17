/**
 * NPM import
 */
import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';


/**
 * Local import
 */
// Composant
import App from 'src/components/App';

/**
 * Code
 */
const rootComponent = (
  <App />

);

render(rootComponent, document.getElementById('root'));
