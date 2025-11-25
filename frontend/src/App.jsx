import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EditorCanvas from './components/editor/EditorCanvas';
import useEditorStore from './store/editorStore';
import Viewer from './pages/Viewer';

const EditorLayout = () => {
  const { addObject } = useEditorStore();

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white">
      {/* Sidebar / Toolbar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col gap-4 border-r border-gray-700">
        <h1 className="text-xl font-bold mb-4">Adhvyk AR Studio</h1>

        <div className="space-y-2">
          <p className="text-sm text-gray-400">Add Objects</p>
          <button
            onClick={() => addObject('box', null, 'Box')}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition"
          >
            Add Box
          </button>
          <button
            onClick={() => addObject('model', 'https://model-url.glb', 'Model')}
            className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-sm transition"
          >
            Add Model (Test)
          </button>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-gray-500">Module 5: Publishing & Serving</p>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <EditorCanvas />

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 bg-gray-800 p-2 rounded flex gap-2">
          <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Translate</button>
          <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Rotate</button>
          <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Scale</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EditorLayout />} />
        <Route path="/view/:id" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
