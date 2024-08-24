import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
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
import "./MeeshoLabelSplit.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF0085", // Your desired color
    },
  },
});

const MeeshoLabelSplit = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile ? uploadedFile.name : "");
    if (uploadedFile) {
      setPdfUrl(URL.createObjectURL(uploadedFile));
      await splitPDF(uploadedFile);
    }
  };

  const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}`;
  };

  const splitPDF = async (file) => {
    setIsProcessing(true);
    setProgress(0);

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Calculate the height of the top 30%
      const topHeight = height * 0.43;

      // Split the top 30%
      const topPage = newPdfDoc.addPage([width, topHeight]);
      const topPageEmbedded = await newPdfDoc.embedPage(page, {
        left: 0,
        bottom: height - topHeight,
        right: width,
        top: height,
      });
      topPage.drawPage(topPageEmbedded, {
        x: 0,
        y: 0,
        width: width,
        height: topHeight,
      });

      // Update progress
      setProgress(((i + 1) / pdfDoc.getPageCount()) * 100);
    }

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const formattedDateTime = getFormattedDateTime();
    const downloadUrl = URL.createObjectURL(blob);
    setDownloadUrl(downloadUrl);

    setIsProcessing(false);
    setProgress(100);

    // Trigger confetti
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
              Meesho Shipping Label Crop
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

export default MeeshoLabelSplit;
