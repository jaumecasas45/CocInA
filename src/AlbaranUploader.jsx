import React, { useState } from 'react';

export default function AlbaranUploader() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  const apiKey = process.env.REACT_APP_OPENAI_KEY;
 const sendImageToOpenAI = async (file) => {
  const base64Image = await getBase64(file);

    console.log("Imagen base64:", base64Image.slice(0, 100) + "..."); // para depuración

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Transcribe el contenido del albarán que vas a recibir en formato JSON.

  1. Extrae el número de albarán si aparece, como "numero_albaran": "..."
  2. Extrae cada línea de la tabla de productos como objetos con los siguientes campos:
  - "producto": nombre exacto tal y como aparece en el albarán
  - "unidad": unidad de medida (ej: kilo)
  - "cantidad": número de Kg. Netos
  - "precio_unitario": valor de la columna "Precio"
  - "importe": valor de la columna "Importe"
  - "proveedor": "Queraltó"
  - "categoria": clasifica el producto en una de estas categorías: Verduras, Carnes, Congelados, Lácteos, Bebidas, Panadería, Preparados, Otros

  Devuelve un objeto con esta estructura:

  {
    "numero_albaran": "2403181",
    "productos": [
      {
        "producto": "...",
        "unidad": "...",
        "cantidad": ...,
        "precio_unitario": ...,
        "importe": ...,
        "proveedor": "Queraltó",
        "categoria": "Verduras"
      }
    ]
  }

  No inventes datos. No añadas texto adicional ni formato markdown. Devuelve solo ese objeto JSON.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      })
    });

    const result = await response.json();
    return result;
  };



  const handleProcessOCR = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const result = await sendImageToOpenAI(image);
      const content = result?.choices?.[0]?.message?.content;

if (!content || typeof content !== 'string') {
  console.error("Respuesta vacía o malformada:", result);
  alert("La respuesta de la IA fue vacía o incorrecta. Revisa la clave API o el formato de la imagen.");
  return;
}

console.log("Respuesta cruda del modelo:", content);

try {
  // Extrae el objeto completo entre llaves
  const cleanJson = content.match(/{[\s\S]*}/)?.[0];
  if (!cleanJson) throw new Error("No se encontró un objeto JSON válido en la respuesta");

  const parsed = JSON.parse(cleanJson);

  const numeroAlbaran = parsed.numero_albaran || "N/A";
  const productos = parsed.productos;

  setData(productos); // Mostrar tabla en pantalla

  // Enviar productos a Google Sheets
  await fetch(`https://cocina-backend.onrender.com/upload-albaran?numero=${encodeURIComponent(numeroAlbaran)}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productos),
});


  console.log(`Guardado en hoja: Albarán ${numeroAlbaran} con ${productos.length} productos`);

} catch (parseError) {
  console.error("Error al parsear la respuesta JSON:", parseError);
  alert("La IA devolvió un formato no válido. Verifica si el albarán es legible.");
}
    } catch (err) {
      console.error("Error procesando OCR:", err);
      alert("No se pudo procesar la imagen. Verifica conexión, clave API y que la imagen sea legible.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subida de Albarán</h1>

      <input type="file" onChange={handleImageUpload} accept="image/*" className="mb-4" />

      {previewUrl && (
        <div className="mb-4">
          <p className="mb-1 text-sm text-gray-600">Previsualización:</p>
          <img src={previewUrl} alt="Previsualización del albarán" className="max-w-full border rounded shadow" />
        </div>
      )}

<button
  onClick={handleProcessOCR}
  className="bg-blue-600 text-white px-10 py-6 rounded-lg text-xl font-semibold disabled:opacity-50"
  disabled={!image || loading}
>
  {loading ? 'Procesando...' : 'Procesar OCR con IA'}
</button>
        {loading ? 'Procesando...' : 'Procesar OCR con IA'}
      </button>

      {data && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Productos Detectados</h2>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Producto</th>
                <th className="border px-2 py-1">Cantidad</th>
                <th className="border px-2 py-1">Unidad</th>
                <th className="border px-2 py-1">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{item.producto}</td>
                  <td className="border px-2 py-1">{item.cantidad}</td>
                  <td className="border px-2 py-1">{item.unidad}</td>
                  <td className="border px-2 py-1">{item.proveedor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
