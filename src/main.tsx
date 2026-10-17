import React from 'react';
import { createRoot } from 'react-dom/client';
import CultivationApp from './CultivationApp';
import './base.css';
import './cultivation.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><CultivationApp/></React.StrictMode>);
