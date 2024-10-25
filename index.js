// const Tesseract = require('tesseract.js');

// async function extractText(imagePath) {
//   try {
//     const { data: { text } } = await Tesseract.recognize(
//       imagePath,
//       'eng',  // language
//       { logger: m => console.log(m) }  // optional progress logger
//     );
//     console.log("Extracted Text:", text);
//     return text;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // Use your function on an image file
// extractText('./image.png');  // replace with your image file path

// const tesseract = require("node-tesseract-ocr");

// const config = {
//   lang: "eng",
//   oem: 1,
//   psm: 3,
// }

// async function readImage(imagePath) {
//   try {
//     const text = await tesseract.recognize(imagePath, config);
//     console.log("Result:", text);
//     return text;
//   } catch (error) {
//     console.log(error.message);
//   }
// }
// readImage('./image1.png');  // replace with your image file path

const vision = require('@google-cloud/vision');

async function detectText(filePath) {
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    
    if (detections.length > 0) {
      console.log("Detected Text:", detections[0].description);
      return detections[0].description;
    } else {
      console.log("No text detected in the image.");
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage
detectText('./image1.png');
