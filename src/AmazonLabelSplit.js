import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import pdfToText from "react-pdftotext";

import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  LinearProgress,
  createTheme,
  ThemeProvider,
} from "@mui/material";

import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import confetti from "canvas-confetti";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff9900", // Your desired color
    },
  },
});

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

const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

const AmazonLabelSplit = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile ? uploadedFile.name : "");

    if (uploadedFile) {
      await processPDF(uploadedFile);
    }
  };

  const processPDF = async (file) => {
    let extractedData = [];
    debugger;
    await pdfToText(file)
      .then((text) => {
        debugger;
        // Split the text by pages if possible, or handle it manually
        const pages = text.split("Tax Invoice/Bill of Supply/Cash Memo"); // Assuming form feed \f is used to separate pages
        debugger;
        //console.log(pages);
        pages.slice(1).forEach((pageText, index) => {
          debugger;
          console.log("=====================================");
          extractedData.push(extractTextBetween(pageText));
          //console.log(extractTextBetween(pageText));
          console.log("=====================================");
        });
      })
      .catch((error) => {
        console.error("Failed to extract text from pdf", error);
        return "ERROR FETCHING DETAILS";
      });

    console.log(extractedData);
    debugger;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    const totalPages = pdfDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      if (i % 2 === 0) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();

        // Add the page to the new document
        const newPage = newPdfDoc.addPage([width, height]);
        const embeddedPage = await newPdfDoc.embedPage(page);

        debugger;
        newPage.drawPage(embeddedPage, {
          x: 0,
          y: 0,
          width,
          height,
        });

        // Add the "This is SAMPLE TEXT" in the middle of the page
        newPage.drawText(
          extractedData[i / 2] || "NOT PROCESSED ! UPLOAD AGAIN",
          {
            x: 50, // Adjust this value to center the text
            y: 170,
            size: 12,
            color: rgb(0, 0, 0), // Red color for visibility
          }
        );
      }
    }

    // Save the new PDF and create a download link
    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const downloadUrl = URL.createObjectURL(blob);
    setDownloadUrl(downloadUrl);
    confetti({
      particleCount: 1000,
      spread: 600,
      origin: { y: 0.6 },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Amazon - Add Product Details
            </Typography>
          </Toolbar>
        </AppBar>
        <Box mt={4} display="flex" justifyContent="center">
          <Card>
            <CardContent>
              <input
                accept="application/pdf"
                style={{ display: "none" }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Upload
                </Button>
              </label>
              {fileName && (
                <Typography variant="body1" component="div" gutterBottom>
                  {fileName}
                </Typography>
              )}
              {isProcessing && (
                <LinearProgress variant="determinate" value={progress} />
              )}
              {downloadUrl && (
                <Box mt={2} display="flex" justifyContent="center">
                  <Button
                    className="download-button"
                    variant="contained"
                    color="primary"
                    href={downloadUrl}
                    download={`Meesho-labels-${getFormattedDateTime()}.pdf`}
                  >
                    Download
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AmazonLabelSplit;
