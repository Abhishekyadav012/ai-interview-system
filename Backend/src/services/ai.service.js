const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

// ======================
// GEMINI CONFIG
// ======================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ======================
// INTERVIEW REPORT SCHEMA
// ======================

const interviewReportSchema = z.object({

    matchScore: z.number(),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum([
                "low",
                "medium",
                "high"
            ])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),

    title: z.string()
});

// ======================
// RESUME PDF SCHEMA
// ======================

const resumePdfSchema = z.object({
    html: z.string()
});

// ======================
// GENERATE INTERVIEW REPORT
// ======================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
You are an expert technical interviewer.

Generate ONLY valid JSON.

Do not add markdown.
Do not add explanations.
Do not add extra text.

Return ONLY this structure:

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "behavioralQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "skillGaps": [
    {
      "skill": string,
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": string,
      "tasks": [string]
    }
  ],
  "title": string
}

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    try {

        console.log(
            "Generating interview report..."
        );

        const response =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents: prompt,

                config: {
                    responseMimeType:
                        "application/json"
                }
            });

        // FIXED ERROR HERE
        const rawText = response.text;

        // if text is function
        const finalText =
            typeof rawText === "function"
                ? rawText()
                : rawText;

        const jsonData =
            JSON.parse(finalText);

        const validatedData =
            interviewReportSchema.parse(
                jsonData
            );

        console.log(
            "Interview report generated successfully"
        );

        return validatedData;

    } catch (error) {

        console.log(
            "ERROR GENERATING REPORT:"
        );

        console.log(error);

        return null;
    }
}

// ======================
// GENERATE PDF FROM HTML
// ======================

async function generatePdfFromHtml(
    htmlContent
) {

    try {

        console.log(
            "Launching Puppeteer browser..."
        );

        const browser =
            await puppeteer.launch({

                headless: true,

                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            });

        const page =
            await browser.newPage();

        console.log(
            "Setting HTML content..."
        );

        await page.setContent(
            htmlContent,
            {
                waitUntil: "networkidle0"
            }
        );

        console.log(
            "Generating PDF..."
        );

        const pdfBuffer =
            await page.pdf({

                format: "A4",

                printBackground: true,

                margin: {
                    top: "20mm",
                    bottom: "20mm",
                    left: "15mm",
                    right: "15mm"
                }
            });

        await browser.close();

        console.log(
            "PDF generated successfully"
        );

        return pdfBuffer;

    } catch (error) {

        console.log(
            "ERROR GENERATING PDF:"
        );

        console.log(error);

        return null;
    }
}

// ======================
// GENERATE RESUME PDF
// ======================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
Generate a professional ATS-friendly resume in HTML format.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Rules:
- Return ONLY valid JSON
- Do NOT return markdown
- Do NOT return extra text

Response format:

{
   "html": "<complete html here>"
}

Requirements:
- Professional modern resume design
- ATS friendly
- 1-2 pages maximum
- Proper spacing and typography
- Highlight important skills
- Tailor resume according to job description
- Use clean CSS styling
- Add sections like:
  Summary,
  Skills,
  Experience,
  Projects,
  Education
- Keep design simple and professional
`;

    try {

        console.log(
            "Generating resume HTML..."
        );

        const response =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents: prompt,

                config: {
                    responseMimeType:
                        "application/json"
                }
            });

        // FIXED ERROR HERE
        const rawText = response.text;

        // if text is function
        const finalText =
            typeof rawText === "function"
                ? rawText()
                : rawText;

        const jsonData =
            JSON.parse(finalText);

        const validatedData =
            resumePdfSchema.parse(
                jsonData
            );

        console.log(
            "Resume HTML generated successfully"
        );

        const pdfBuffer =
            await generatePdfFromHtml(
                validatedData.html
            );

        if (!pdfBuffer) {

            console.log(
                "PDF buffer generation failed"
            );

            return null;
        }

        return pdfBuffer;

    } catch (error) {

        console.log(
            "ERROR GENERATING RESUME PDF:"
        );

        console.log(error);

        return null;
    }
}

// ======================
// EXPORTS
// ======================

module.exports = {
    generateInterviewReport,
    generateResumePdf
};