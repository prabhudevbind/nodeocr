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


// const tesseract = require("node-tesseract-ocr");
// const fs = require('fs');
// const axios = require('axios');
// require('dotenv').config();

// class TextProcessor {
//   constructor() {
//     this.tesseractConfig = {
//       lang: "eng",
//       oem: 1,
//       psm: 3,
//     };
//   }

//   async extractText(imagePath) {
//     try {
//       return await tesseract.recognize(imagePath, this.tesseractConfig);
//     } catch (error) {
//       throw new Error(`Text extraction failed: ${error.message}`);
//     }
//   }

//   processToCSV(text) {
//     const lines = text.split('\n')
//       .filter(line => line.trim())
//       .map(line => line.replace(/,/g, ';')); // Change commas to semicolons to avoid CSV issues
//     return lines.join('\n');
//   }

//   saveToFile(data, filename) {
//     try {
//       fs.writeFileSync(filename, data);
//       console.log(`File saved successfully: ${filename}`);
//     } catch (error) {
//       throw new Error(`File save failed: ${error.message}`);
//     }
//   }

//   async processImage(imagePath, outputPath = 'output.csv') {
//     try {
//       // Extract text
//       const extractedText = await this.extractText(imagePath);
//       console.log('Extracted text:', extractedText);

//       // Convert to CSV format
//       const csvData = this.processToCSV(extractedText);

//       // Save to file
//       this.saveToFile(csvData, outputPath);
      
//       return {
//         success: true,
//         outputPath,
//         extractedText
//       };
//     } catch (error) {
//       console.error('Processing failed:', error.message);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }
// }

// class VoterDataProcessor {
//   constructor() {
//     this.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//     this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';
//   }

//   async processWithGemini(text) {
//     const prompt = `
//       Analyze and correct this voter registration data. 
//       Requirements:
//       1. Extract all voter records
//       2. Correct spelling mistakes in names
//       3. Standardize formatting
//       4. Output as CSV with headers:
//          id,ID,Name,Father's Name,House Number,Age,Gender,Status
      
//       Raw data:
//       ${text}
//     `;

//     try {
//       const response = await axios.post(
//         `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
//         {
//           contents: [{
//             parts: [{
//               text: prompt
//             }]
//           }]
//         }
//       );

//       return response.data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Gemini API Error:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async validateData(data) {
//     const prompt = `
//       Validate this voter data and identify any inconsistencies or errors:
//       ${data}
      
//       Check for:
//       1. Valid ID formats // ‘ANE5030564
//       2.id 
//       3. Proper name capitalizations
//       4. Age ranges (18-120)
//       5. Gender values (Male/Female)
//       6. Missing required fields
//       7.check not have dublicate id 
      
//       Return only the errors found, or "Data validated successfully" if no errors.
//     `;

//     try {
//       const response = await axios.post(
//         `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
//         {
//           contents: [{
//             parts: [{
//               text: prompt
//             }]
//           }]
//         }
//       );

//       return response.data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Validation Error:', error.message);
//       throw error;
//     }
//   }

//   saveToCSV(data, filename = 'voter_data.csv') {
//     fs.writeFileSync(filename, data);
//     console.log(`Data saved to ${filename}`);
//   }

//   async process(rawText) {
//     try {
//       // Step 1: Process with Gemini
//       console.log('Processing data with Gemini...');
//       const correctedData = await this.processWithGemini(rawText);

//       // Step 2: Validate the corrected data
//       console.log('Validating processed data...');
//       const validationResult = await this.validateData(correctedData);
      
//       if (validationResult !== 'Data validated successfully') {
//         console.warn('Validation warnings:', validationResult);
//       }

//       // Step 3: Save to CSV
//       this.saveToCSV(correctedData);

//       return {
//         success: true,
//         data: correctedData,
//         validation: validationResult
//       };

//     } catch (error) {
//       console.error('Processing failed:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }
// }

// // Usage example
// async function main() {
//   const imagePath = './image1.png'; // Path to your image file
//   const textProcessor = new TextProcessor();
//   const voterDataProcessor = new VoterDataProcessor();

//   // Step 1: Extract text from image
//   const result = await textProcessor.processImage(imagePath, 'extracted_text.txt');

//   if (result.success) {
//     console.log('Text extraction completed successfully!');
    
//     // Read extracted text
//     const rawText = fs.readFileSync('extracted_text.txt', 'utf8');

//     // Step 2: Process the extracted text
//     const processingResult = await voterDataProcessor.process(rawText);

//     if (processingResult.success) {
//       console.log('Processing completed successfully!');
//       if (processingResult.validation !== 'Data validated successfully') {
//         console.log('Validation notes:', processingResult.validation);
//       }
//     } else {
//       console.error('Processing failed:', processingResult.error);
//     }
//   } else {
//     console.error('Text extraction failed:', result.error);
//   }
// }

// main();
const fs = require('fs');
const { fromPath } = require('pdf2pic');
const NodeCache = require('node-cache');
const path = require('path');
const tesseract = require("node-tesseract-ocr");
const axios = require('axios');

require('dotenv').config();

// Path to your PDF file
const pdfPath = "./hello.pdf";

// Create cache instance
const myCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class PDFProcessor {
    constructor(cacheDir = './cache', outputDir = './output') {
        this.cacheDir = cacheDir;
        this.outputDir = outputDir;
        this.setupDirectories();
    }

    setupDirectories() {
        // Create cache and output directories if they don't exist
        [this.cacheDir, this.outputDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async splitPDFToImages(pdfPath) {
      try {
          // Check if PDF exists
          if (!fs.existsSync(pdfPath)) {
              throw new Error('PDF file not found');
          }
  
          // Generate cache key from PDF path
          const cacheKey = path.basename(pdfPath, '.pdf');
  
          // Check cache first
          let imageNames = myCache.get(cacheKey);
          if (imageNames) {
              console.log('Retrieved from cache:', imageNames);
              return imageNames;
          }
  
          // Options for pdf2pic with A4 dimensions at 300 DPI for highest quality
          const options = {
              density: 300,          // High quality DPI
              saveFilename: cacheKey,
              savePath: this.cacheDir,
              format: 'png',
              width: 2480,           // A4 width in pixels at 300 DPI
              height: 3508           // A4 height in pixels at 300 DPI
          };
  
          const pdfToPic = fromPath(pdfPath, options);
  
          // Convert all pages and get the image names
          const pages = await pdfToPic.bulk(-1);
          imageNames = pages.map((_, i) => `${cacheKey}_page_${i + 1}.png`);
  
          // Store in memory cache
          myCache.set(cacheKey, imageNames);
  
          console.log('PDF split into images successfully');
          return imageNames;
  
      } catch (error) {
          console.error('Error processing PDF:', error);
          throw error;
      }
  }
  
    getCachedImages(pdfPath) {
        const cacheKey = path.basename(pdfPath, '.pdf');
        return myCache.get(cacheKey);
    }

    clearCache(pdfPath) {
        const cacheKey = path.basename(pdfPath, '.pdf');
        myCache.del(cacheKey);

        const cacheFiles = fs.readdirSync(this.cacheDir).filter(file => file.startsWith(`${cacheKey}_page_`));
        cacheFiles.forEach(file => fs.unlinkSync(path.join(this.cacheDir, file)));
    }
}

class TextProcessor {
    constructor() {
        this.tesseractConfig = {
            lang: "eng",
            oem: 1,
            psm: 3,
        };
    }

    async extractText(imagePath) {
        try {
            return await tesseract.recognize(imagePath, this.tesseractConfig);
        } catch (error) {
            throw new Error(`Text extraction failed: ${error.message}`);
        }
    }

    processToCSV(text) {
        const lines = text.split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/,/g, ';')); // Change commas to semicolons to avoid CSV issues
        return lines.join('\n');
    }

    saveToFile(data, filename) {
        try {
            fs.writeFileSync(filename, data);
            console.log(`File saved successfully: ${filename}`);
        } catch (error) {
            throw new Error(`File save failed: ${error.message}`);
        }
    }

    async processImage(imagePath, outputPath) {
        try {
            // Extract text
            const extractedText = await this.extractText(imagePath);
            console.log(`Extracted text from ${imagePath}:`, extractedText);

            // Convert to CSV format
            const csvData = this.processToCSV(extractedText);

            // Save to file
            this.saveToFile(csvData, outputPath);
            
            return {
                success: true,
                outputPath,
                extractedText
            };
        } catch (error) {
            console.error(`Processing failed for ${imagePath}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

class VoterDataProcessor {
    constructor() {
        this.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';
    }

    async processWithGemini(text) {
        const prompt = `
            Analyze and correct this voter registration data. 
            Requirements:
            1. Extract all voter records
            2. Correct spelling mistakes in names
            3. Standardize formatting
            4. Output as CSV with headers:
                id,ID,Name,Father's Name,House Number,Age,Gender,Status

            Raw data:
            ${text}
        `;

        try {
            const response = await axios.post(
                `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
                { contents: [{ parts: [{ text: prompt }] }] }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async validateData(data) {
        const prompt = `
            Validate this voter data and identify any inconsistencies or errors:
            ${data}
            
            Check for:
            1. Valid ID formats
            2. Proper name capitalizations
            3. Age ranges (18-120)
            4. Gender values (Male/Female)
            5. Missing required fields
            6. Duplicate IDs

            Return "Data validated successfully" if no errors.
        `;

        try {
            const response = await axios.post(
                `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
                { contents: [{ parts: [{ text: prompt }] }] }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Validation Error:', error.message);
            throw error;
        }
    }

    saveToCSV(data, filename) {
        fs.writeFileSync(filename, data);
        console.log(`Data saved to ${filename}`);
    }

    async process(rawText, outputPath) {
        try {
            // Process with Gemini
            console.log('Processing data with Gemini...');
            const correctedData = await this.processWithGemini(rawText);

            // Validate corrected data
            console.log('Validating processed data...');
            const validationResult = await this.validateData(correctedData);
            
            if (validationResult !== 'Data validated successfully') {
                console.warn('Validation warnings:', validationResult);
            }

            // Save to CSV
            this.saveToCSV(correctedData, outputPath);

            return {
                success: true,
                data: correctedData,
                validation: validationResult
            };
        } catch (error) {
            console.error('Processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Process all images in the cache directory
async function processCachedImages() {
    const cacheDir = './cache';
    const outputDir = './output';

    if (!fs.existsSync(cacheDir)) {
        console.error('Cache directory not found.');
        return;
    }

    const imageFiles = fs.readdirSync(cacheDir).filter(file => file.endsWith('.png'));
    const textProcessor = new TextProcessor();
    const voterDataProcessor = new VoterDataProcessor();

    for (const imageFile of imageFiles) {
        const imagePath = path.join(cacheDir, imageFile);
        const textOutputPath = path.join(outputDir, `${path.basename(imageFile, '.png')}_extracted.csv`);

        // Extract text from the image
        const extractionResult = await textProcessor.processImage(imagePath, textOutputPath);

        if (extractionResult.success) {
            console.log(`Text extraction completed for ${imageFile}!`);

            // Process the extracted text
            const processingOutputPath = path.join(outputDir, `${path.basename(imageFile, '.png')}_processed.csv`);
            const processingResult = await voterDataProcessor.process(extractionResult.extractedText, processingOutputPath);

            if (processingResult.success) {
                console.log(`Processing completed for ${imageFile}!`);
                if (processingResult.validation !== 'Data validated successfully') {
                    console.log(`Validation notes for ${imageFile}:`, processingResult.validation);
                }
            } else {
                console.error(`Processing failed for ${imageFile}:`, processingResult.error);
            }
        } else {
            console.error(`Text extraction failed for ${imageFile}:`, extractionResult.error);
        }
    }
}

// Execute the process
(async () => {
    const pdfProcessor = new PDFProcessor();

    try {
        const imageNames = await pdfProcessor.splitPDFToImages(pdfPath);
        console.log('Generated Images:', imageNames);
        await processCachedImages();
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
