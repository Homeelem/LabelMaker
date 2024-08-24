import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/webpack";

const PDFExtractor = () => {
  const [file, setFile] = useState(null);
  const [productDetails, setProductDetails] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item) => item.str).join(" ");
      fullText += textItems + " ";
    }

    return fullText;
  };

  const extractProductDetails = (text) => {
    // Example regex for extracting product details (customize as needed)
    debugger;
    const productRegex = /Product Name:\s*(.*)\n.*Price:\s*(\d+\.?\d*)/g;
    let match;
    let details = "Vikram";

    while ((match = productRegex.exec(text)) !== null) {
      details += `Product Name: ${match[1]}, Price: ${match[2]}\n`;
    }

    return "Vikram";
  };

  const handleExtract = async () => {
    debugger;
    if (file) {
      const text = await extractTextFromPDF(file);
      const details = extractProductDetails(text);
      setProductDetails(details);
    }
  };

  const createPDFWithDetails = async () => {
    debugger;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    page.drawText(productDetails, {
      x: 50,
      y: height - 50,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      lineHeight: 14,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "Product_Details.pdf");
  };

  return (
    <div>
      <h1>PDF Product Details Extractor</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleExtract}>Extract Product Detailssssss</button>
      {productDetails && (
        <div>
          <h2>Extracted Product Details:</h2>
          <pre>{productDetails}</pre>
          <button onClick={createPDFWithDetails}>
            Download Product Details PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFExtractor;
