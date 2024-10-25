// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// require('dotenv').config();

// class ProjectGenerator {
//     constructor() {
//         this.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//         this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';
//     }

//     async generateContent(prompt) {
//         try {
//             const response = await axios.post(
//                 `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
//                 {
//                     contents: [{
//                         parts: [{ text: prompt }]
//                     }]
//                 }
//             );
//             return response.data.candidates[0].content.parts[0].text;
//         } catch (error) {
//             console.error('Error generating content:', error);
//             throw error;
//         }
//     }

//     async createProject(filePath, modelDetails) {
//         try {
//             // Generate prompt
//             const prompt = `Generate a Node.js code for ${filePath} with the following database model details:
//                 - Fields: ${JSON.stringify(modelDetails.fields)}
//                 - Include Express.js and Mongoose integration
//                 - Handle HTTP requests if this is a route file`;

//             // Generate content with Gemini API
//             const generatedCode = await this.generateContent(prompt);

//             // Determine file structure
//             const directory = path.dirname(filePath);
//             fs.mkdirSync(directory, { recursive: true });

//             // Write code to file
//             fs.writeFileSync(filePath, generatedCode, 'utf8');
//             console.log(`Created ${filePath} with generated code.`);

//         } catch (error) {
//             console.error('Error creating project:', error);
//         }
//     }
// }

// (async () => {
//     const generator = new ProjectGenerator();
//     // Use a relative path for the file
//     const filePath = './routes/todoRoutes.js'; // Updated to relative path
//     const modelDetails = {
//         fields: { "title": "string", "completed": "boolean", "dueDate": "Date" }
//     };
//     await generator.createProject(filePath, modelDetails);
// })();

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class RentalProjectGenerator {
    constructor() {
        this.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';
    }

    async generateContent(prompt) {
        try {
            const response = await axios.post(
                `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                }
            );
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }

   