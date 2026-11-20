import React from 'react';
import { createRoot } from 'react-dom/client';
import { DAAAppFactory } from './app.jsx';
import * as DATA from './data.js';
import './styles.css';

const App = DAAAppFactory(React, DATA);
createRoot(document.getElementById('root')).render(<App/>);
