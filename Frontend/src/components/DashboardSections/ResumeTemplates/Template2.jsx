// templates/fancyTemplate.js
import { jsPDF } from "jspdf";

export function generateTemplate2PDF(resume) {
    // Create a jsPDF document
    const doc = new jsPDF("portrait", "pt", "letter");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Define margins and starting positions
    const marginLeft = 50;
    let currentY = 80; // vertical start

    // Fonts, colors, line spacing
    doc.setFont("helvetica", "normal");
    const normalFontSize = 12;
    const headingFontSize = 14;
    const subheadingFontSize = 18;
    const lineSpacing = 16; // spacing between lines

    // -------------------------
    // Header Section
    // -------------------------

    // "Hello"
    doc.setFontSize(subheadingFontSize);
    doc.setTextColor(225, 74, 74); // a reddish color, for example
    doc.text("Hello", marginLeft, currentY);
    currentY += lineSpacing * 2;

    // "I’m Your Name"
    doc.setFontSize(24);
    doc.setTextColor(0); // black
    doc.setFont("helvetica", "bold");
    doc.text(`I'm ${resume.name}` || "I'm Your Name", marginLeft, currentY);
    currentY += lineSpacing * 2;

    // Contact Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(normalFontSize);
    const addressLines = [
        resume.address || "123 YOUR STREET",
        resume.phone || "(123) 456-7890",
        resume.email || "NO_REPLY@EXAMPLE.COM",
    ];
    addressLines.forEach((line) => {
        doc.text(line, marginLeft, currentY);
        currentY += lineSpacing;
    });
    currentY += lineSpacing; // extra gap

    // Draw a faint horizontal line or a small gap
    doc.setDrawColor(200);
    doc.setLineWidth(1);
    doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
    currentY += lineSpacing * 2;

    // -------------------------
    // Skills Section
    // -------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(headingFontSize);
    doc.setTextColor(225, 74, 74);
    doc.text("Skills", marginLeft, currentY);

    currentY += lineSpacing * 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(normalFontSize);
    doc.setTextColor(0);
    // black

    // If skills are in an array, you can bullet them. Or you can parse them from resume.skills
    // For example, if resume.skills is an array of strings:
    const skillLines = resume.skills.length
        ? resume.skills
        : ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit"];
    skillLines.forEach((skill) => {
        doc.setFillColor(0, 0, 0); // sets bullet fill color to black
        doc.circle(marginLeft, currentY - 4, 2, "F") // small bullet
        doc.text(skill, marginLeft + 10, currentY);
        currentY += lineSpacing;
    });
    currentY += lineSpacing;

    // -------------------------
    // Experience Section
    // -------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(headingFontSize);
    doc.setTextColor(225, 74, 74);
    doc.text("Experience", marginLeft, currentY);
    currentY += lineSpacing * 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(normalFontSize);
    doc.setTextColor(0);
    // For each experience, show month-year, location, job title, bullet points
    // If resume.workExperience is an array:
    // e.g. [ { company, jobTitle, duration, responsibilities }, ... ]
    const experience = resume.workExperience.length
        ? resume.workExperience
        : [
            {
                company: "Company Name, Location",
                duration: "Month 20XX - Present",
                jobTitle: "Job Title",
                responsibilities: "Lorem ipsum dolor sit amet..."
            },
        ];

    experience.forEach((exp) => {
        // Month + Year + Job Title
        doc.setFont("helvetica", "bold");
        doc.text(`${exp.duration || "Month 20XX - Present"} - ${exp.jobTitle || "Job Title"}`, marginLeft, currentY);
        currentY += lineSpacing;

        // Company name
        doc.setFont("helvetica", "normal");
        doc.text(exp.company || "Company Name, Location", marginLeft, currentY);
        currentY += lineSpacing;
        // Split responsibilities by new line
        const splitPoints = (exp.responsibilities || "Lorem ipsum...").split(/\r?\n/);
        console.log("Split Points are :", splitPoints)

        splitPoints.forEach(point => {
            if (point.trim()) {
                // Wrap text to fit within page width
                const wrappedLines = doc.splitTextToSize(point.trim(), 500);
                console.log("Wrapped Lines: ", wrappedLines)
                wrappedLines.forEach((line, idx) => {
                    if (idx === 0) {
                        // First line → draw bullet + text
                        doc.circle(marginLeft, currentY - 4, 2, "F");
                        doc.text(line, marginLeft + 10, currentY);
                    } else {
                        // Wrapped lines → only text (no bullet)
                        doc.text(line, marginLeft + 10, currentY);
                    }
                    currentY += lineSpacing;
                });
            }
        });
        currentY += lineSpacing;
    });

    // -------------------------
    // Education Section
    // -------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(headingFontSize);
    doc.setTextColor(225, 74, 74);
    doc.text("Education", marginLeft, currentY);
    currentY += lineSpacing * 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(normalFontSize);
    doc.setTextColor(0); // black
    // If resume.education is an array of { school, degree, graduationYear }:
    const education = resume.education.length
        ? resume.education
        : [
            {
                school: "College Name, Location",
                degree: "Degree",
                graduationYear: "Month 20XX"
            },
        ];

    education.forEach((edu) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${edu.graduationYear || "Month 20XX"} - ${edu.degree || "Degree"}`, marginLeft, currentY);
        currentY += lineSpacing;

        doc.setFont("helvetica", "normal");
        doc.text(edu.school || "College Name, Location", marginLeft, currentY);
        currentY += lineSpacing * 2;
    });

    // -------------------------
    // Additional Section
    // -------------------------


    // If resume.additionalContent.languages or references exist, display them
    const { languages, references } = resume.additionalContent;
    if (languages.length > 0 || references.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(headingFontSize);
        doc.setTextColor(225, 74, 74);
        doc.text("Additional", marginLeft, currentY);
        currentY += lineSpacing * 1.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(normalFontSize);
        doc.setTextColor(0); // black
    }
    // Languages
    if (languages && languages.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Languages:", marginLeft, currentY);
        doc.setFont("helvetica", "normal");
        currentY += lineSpacing;

        languages.forEach((lang) => {
            doc.circle(marginLeft, currentY - 4, 2, "F");
            doc.text(lang, marginLeft + 10, currentY);
            currentY += lineSpacing;
        });
        currentY += lineSpacing;
    }

    // References
    if (references && references.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("References:", marginLeft, currentY);
        doc.setFont("helvetica", "normal");
        currentY += lineSpacing;

        references.forEach((ref) => {
            // Example: "John Doe - (123) 456-7890"
            const refLine = `${ref.name} - ${ref.contact}`;
            doc.circle(marginLeft, currentY - 4, 2, "F");
            doc.text(refLine, marginLeft + 10, currentY);
            currentY += lineSpacing;
        });
        currentY += lineSpacing;
    }


    return doc;
}
