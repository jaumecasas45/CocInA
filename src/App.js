import React, { useState } from 'react';
import AlbaranUploader from './AlbaranUploader';
import ConsultaStock from './ConsultaStock';

export default function App() {
  const [view, setView] = useState('landing');

  if (view === 'landing') {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Bienvenido a CocInA</h1>
        <button
          onClick={() => setView('entrada')}
          className="bg-blue-600 text-white px-6 py-3 rounded mr-4 hover:bg-blue-700 transition"
        >
          ENTRADA ALBARÁN
        </button>
        <button
          onClick={() => setView('consulta')}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        >
          CONSULTA STOCK
        </button>
      </div>
    );
  }

  if (view === 'entrada') {
    return (
      <div>
        <button
          onClick={() => setView('landing')}
          className="m-4 text-blue-600 underline"
        >
          ← Volver
        </button>
        <AlbaranUploader />
      </div>
    );
  }

  if (view === 'consulta') {
    return (
      <div>
        <button
          onClick={() => setView('landing')}
          className="m-4 text-blue-600 underline"
        >
          ← Volver
        </button>
        <ConsultaStock />
      </div>
    );
  }

  return null;
}

