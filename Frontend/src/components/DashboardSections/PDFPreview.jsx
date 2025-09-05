import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
 
// ✅ tell pdfjs where the worker is
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
 
export default function PDFPreview({ pdfBlob }) {
  const [images, setImages] = useState([]);
 
  useEffect(() => {
    if (!pdfBlob) return;
 
    const renderPDF = async () => {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
 
      const imgs = [];
 
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
 
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
 
        await page.render({ canvasContext: context, viewport }).promise;
 
        imgs.push(canvas.toDataURL("image/png"));
      }
 
      setImages(imgs);
    };
 
    renderPDF();
  }, [pdfBlob]);
 
  return (
    <div style={{ overflow: "auto", width: "100%", height: "600px", border: "1px solid #ddd", padding: "8px" }}>
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`Page ${idx + 1}`}
          style={{ marginBottom: "16px", width: "100%", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
        />
      ))}
    </div>
  );
}