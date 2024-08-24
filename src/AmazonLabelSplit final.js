import React, { useState } from "react";
import pdfToText from "react-pdftotext";

function extractProductQuantity(input) {
  const match = input.match(/HSN\s*(.*?)\s*IGST/);
  if (match) {
    return match[1].replace(/\s+/g, " ").trim().split(" ")[2];
  }
  return null; //
}

function extractFullProductDescription(input) {
  const fullProductDescriptionRegex = /Total Amount\s*(.*?)\s*HSN/;
  const match = input.match(fullProductDescriptionRegex);
  return match ? match[1] : null;
}

function extractShortProductDetails(fullProductDescription) {
  const shortProductDetailsRegex = /.*\(([^)]+)\)[^(]*$/;
  const match = fullProductDescription.match(shortProductDetailsRegex);
  return match ? match[1].trim() : null;
}

function generateLabelText(
  shortProductDetails,
  fullProductDescription,
  productQty
) {
  const shortProductName = fullProductDescription.slice(0, 50).slice(4);
  return `SKU:${shortProductDetails}|P:${shortProductName}|Q:${productQty}`.trim();
}

function extractTextBetween(input) {
  const productQty = extractProductQuantity(input);
  const fullProductDescription = extractFullProductDescription(input);

  if (fullProductDescription) {
    const shortProductDetails = extractShortProductDetails(
      fullProductDescription
    );

    if (shortProductDetails) {
      return generateLabelText(
        shortProductDetails,
        fullProductDescription,
        productQty
      );
    }
  }

  return null; // Return null if any part of the extraction fails
}

const AmazonLabelSplit = () => {
  const [fileName, setFileName] = useState("");

  const extractText = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);

    pdfToText(file)
      .then((text) => {
        // Split the text by pages if possible, or handle it manually
        const pages = text.split("Tax Invoice/Bill of Supply/Cash Memo"); // Assuming form feed \f is used to separate pages
        // debugger;
        //console.log(pages);
        pages.slice(1).forEach((pageText, index) => {
          console.log("=====================================");
          console.log(extractTextBetween(pageText));
          console.log("=====================================");
        });
      })
      .catch((error) =>
        console.error("Failed to extract text from pdf", error)
      );
  };

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" accept="application/pdf" onChange={extractText} />
      {fileName && <p>Processing file: {fileName}</p>}
    </div>
  );
};

export default AmazonLabelSplit;
