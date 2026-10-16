import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import LegacyApp from './LegacyApp';
import CultivationApp from './CultivationApp';
import './cultivation.css';

function App(){
  const [mode,setMode]=useState<'cultivation'|'classic'>('cultivation');
  return <><div className="mode-switch"><span>蛊真人杀 <b>v2.0</b></span><div>
    <button className={mode==='cultivation'?'active':''} onClick={()=>setMode('cultivation')}>升仙对决 · 新模式</button>
    <button className={mode==='classic'?'active':''} onClick={()=>setMode('classic')}>经典身份局</button>
  </div><small>独立存档 · 本局资源 · 原创同人</small></div>
  <div hidden={mode!=='cultivation'}><CultivationApp active={mode==='cultivation'}/></div>
  {mode==='classic'&&<LegacyApp/>}</>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
