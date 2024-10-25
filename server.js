const fs = require('fs');
const { fromPath } = require('pdf2pic');
const NodeCache = require('node-cache');
const path = require('path');

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

            // Options for pdf2pic
            const options = {
                density: 100,
                saveFilename: cacheKey,
                savePath: this.outputDir,
                format: 'png',
                width: 1920,
                height: 1080
            };

            const pdfToPic = fromPath(pdfPath, options);

            // Get the number of pages and process each page to an image
            const numPages = (await pdfToPic.bulk(-1)).length;
            imageNames = Array.from({ length: numPages }, (_, i) => `${cacheKey}_page_${i + 1}.png`);

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

    clearAllCache() {
        myCache.flushAll();
        const cacheFiles = fs.readdirSync(this.cacheDir);
        cacheFiles.forEach(file => fs.unlinkSync(path.join(this.cacheDir, file)));
    }

    getImageMetadata(imageName) {
        const cacheFilePath = path.join(this.cacheDir, `${imageName}.cache`);
        if (fs.existsSync(cacheFilePath)) {
            return JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        }
        return null;
    }
}

// Usage example
(async () => {
    const pdfProcessor = new PDFProcessor();

    try {
        // Split PDF into images
        const imageNames = await pdfProcessor.splitPDFToImages(pdfPath);
        console.log('Generated Images:', imageNames);

        // Fetching cached images
        const cachedImages = pdfProcessor.getCachedImages(pdfPath);
        console.log('Cached Images:', cachedImages);

        // Example of getting metadata for the first image
        if (imageNames.length > 0) {
            const metadata = pdfProcessor.getImageMetadata(imageNames[0]);
            console.log('Metadata for first image:', metadata);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
