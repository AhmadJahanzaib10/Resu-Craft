import { jsPDF } from "jspdf";
export function generateTemplate8PDF(resume) {
    console.log("resume", resume);
    const doc = new jsPDF("portrait", "pt", "letter");
    const pageWidth = doc.internal.pageSize.getWidth();
    // const pageHeight = doc.internal.pageSize.getHeight();

    // Colors & Fonts
    const highlightColor = [0, 0, 0]; // Greenish color for lines and bullets (from Template5)
    const headingColor = [0, 0, 0];       // Black for headings (from Template5)
    const bodyTextColor = [74, 68, 68];   // Dark gray for body text (from Template5)
    const bulletColor = [0, 0, 0];   // Green for bullets (matching the attached template)

    // Basic positions and spacing
    const marginLeft = 50;
    let currentY = 50;  // Starting Y position (adjusted to match the attached template)
    const lineHeight = 14;
    const sectionGap = 20;

    // -------------------------
    // HEADER: Name, Contact Info
    // -------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...headingColor); // Name in black to match the attached template
    // Candidate name centered
    const nameText = resume.name || "DEBRA NELSON";
    const textWidth =
        (doc.getStringUnitWidth(nameText) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
    const xCentered = (pageWidth - textWidth) / 2;

    doc.text(nameText, xCentered, currentY);
    currentY += 25;

    // Email, Address, Phone
    doc.setFont("helvetica", "light");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    // Combine contact info
    const contactInfo = `${resume.address || "San Diego"} | ${resume.email || "email@email.com"} | ${resume.phone || "319-000-0000"}`;

    // ✅ Automatically wrap text if too long
    const maxWidth = pageWidth - marginLeft * 2;
    const wrappedContact = doc.splitTextToSize(contactInfo, maxWidth);

    // Center align each line
    wrappedContact.forEach((line) => {
        const contactWidth = doc.getTextWidth(line);
        const contactX = (pageWidth - contactWidth) / 2;
        doc.text(line, contactX, currentY);
        currentY += lineHeight; // Move down for next line if wrapped
    });

    currentY += sectionGap;

    // -------------------------
    // SUMMARY
    // -------------------------

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 10;

    // Education Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...headingColor);
    doc.text("SUMMARY", marginLeft, currentY + 10);
    currentY += 20;

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    // ✅ Automatically wrap summary text
    const maxWidthPage = pageWidth - marginLeft * 2;
    const wrappedSummary = doc.splitTextToSize(resume.summary || "", maxWidthPage);

    doc.text(wrappedSummary, marginLeft, currentY + 10);
    currentY += wrappedSummary.length * lineHeight; // Adjust height based on wrapped lines
    currentY += sectionGap;

    // -------------------------
    // EDUCATION
    // -------------------------

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 10;

    // Education Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...headingColor);
    doc.text("EDUCATION", marginLeft, currentY + 10);
    currentY += 20;

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 20;

    if (resume.education && resume.education.length > 0) {
        resume.education.forEach((edu) => {
            // Degree and institution on one line
            const eduLine = `${edu.degree || "Degree"} | ${edu.school || "University Name, City, State"}`;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...headingColor)
            doc.text(eduLine, marginLeft, currentY);
            currentY += 20;

            // Dates on the next line
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...bodyTextColor)
            doc.text(edu.graduationYear, marginLeft, currentY);
            currentY += 20;
        });
    } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Bachelor of Science in Accounting | BOSTON UNIVERSITY, Boston, MA", marginLeft, currentY);
        currentY += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("August 2010 - May 2015", marginLeft, currentY);
        currentY += lineHeight + 15;
    }

    // -------------------------
    // SKILLS
    // -------------------------

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 10;

    // SKILLS Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...headingColor);
    doc.text("SKILLS", marginLeft, currentY + 10);
    currentY += 20;

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    // Calculate exact 2-column layout
    const usableWidth = pageWidth - marginLeft * 2;  // total content width
    const columnWidth = usableWidth / 2;             // half of that for each column
    const col1X = marginLeft;
    const col2X = marginLeft + columnWidth;
    let xPos = col1X;
    let colCount = 0;

    resume.skills.forEach((skill) => {
        // Draw bullet
        doc.setFillColor(...bulletColor);
        doc.circle(xPos + 20, currentY - 4, 2, "F");
        doc.text(skill, xPos + 25, currentY);

        colCount++;

        // Move to next line after 2 skills
        if (colCount % 2 === 0) {
            currentY += 20;
            xPos = col1X;
        } else {
            xPos = col2X;
        }
    });
    currentY += 20;

    // -------------------------
    // SKILLS
    // -------------------------

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 10;

    // EXPERIENCE Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...headingColor);
    doc.text("EXPERIENCE", marginLeft, currentY + 10);
    currentY += 20;

    // Horizontal Line
    doc.setDrawColor(...highlightColor); // set color
    doc.setLineWidth(1);                 // thickness
    doc.line(50, currentY, pageWidth - 50, currentY); // from left margin to right margin
    currentY += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    if (resume.workExperience && resume.workExperience.length > 0) {
        resume.workExperience.forEach((exp) => {
            // Job title + company on left, dates on right (same line)
            const titleLine = `${exp.jobTitle || "Job Title"} | ${exp.company || "Company Name, City, State"}`;
            const dateLine = `${exp.startDate || ""} - ${exp.endDate || ""}`;

            doc.setFont("helvetica", "bold");
            doc.setTextColor(...headingColor);

            // Get the width of the date text so we can right-align it
            const dateWidth = doc.getTextWidth(dateLine);
            const rightAlignedX = pageWidth - marginLeft - dateWidth;

            // Draw job title + company
            doc.text(titleLine, marginLeft, currentY);

            // Draw dates aligned to right side on the same line
            doc.text(dateLine, rightAlignedX, currentY);

            currentY += lineHeight + 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.setTextColor(...bodyTextColor);

            // Responsibilities in bullet points
            let respPoints = [];
            if (exp.responsibilities) {
                if (typeof exp.responsibilities === "string") {
                    respPoints = exp.responsibilities
                        .split(/\r?\n/)
                        .filter(point => point.trim().length > 0);
                } else if (Array.isArray(exp.responsibilities)) {
                    // 🔥 Split each array item by \n as well
                    respPoints = exp.responsibilities.flatMap(item =>
                        item.split(/\r?\n/).filter(point => point.trim().length > 0)
                    );
                }
            }

            respPoints.forEach(point => {
                if (point.trim()) {
                    doc.setFillColor(...bulletColor);
                    const bulletPoint = point.trim();
                    const wrappedLines = doc.splitTextToSize(
                        bulletPoint,
                        pageWidth - marginLeft * 2 - 20
                    );

                    wrappedLines.forEach((line, i) => {
                        if (i === 0) {
                            // First line → draw bullet + text
                            doc.circle(marginLeft + 20, currentY - 4, 2, "F"); // Green bullet
                            doc.text(line, marginLeft + 30, currentY);
                        } else {
                            // Continuation lines → only text (no extra bullet)
                            doc.text(line, marginLeft + 20, currentY);
                        }
                        currentY += lineHeight;
                    });
                }
            });
            currentY += 10;
        });
    } else {
        // Default experience entries
        doc.setFont("helvetica", "bold");
        doc.text("Lead Bank Teller | US Bank, Columbus, OH", marginLeft, currentY);
        currentY += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.text("June 2018 - present", marginLeft, currentY);
        currentY += lineHeight + 5;

        const job1Points = [
            "Connected with customers to cross-sell banking products, contributing to a 30% increase in new account sign-ups and a 20% increase in credit card applications within a fiscal year."
        ];
        job1Points.forEach(point => {
            doc.setFillColor(...bulletColor);
            doc.circle(marginLeft, currentY - 3, 2, "F");
            const wrappedLines = doc.splitTextToSize(point, pageWidth - marginLeft * 2 - 20);
            wrappedLines.forEach((line) => {
                doc.text(line, marginLeft + 10, currentY);
                currentY += lineHeight;
            });
        });
        currentY += 15;

        doc.setFont("helvetica", "bold");
        doc.text("Bank Teller | Chase, Columbus, OH", marginLeft, currentY);
        currentY += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.text("August 2015 - May 2018", marginLeft, currentY);
        currentY += lineHeight + 5;

        const job2Points = [
            "Identified and prevented fraudulent transactions, protecting against potential losses exceeding $100,000."
        ];
        job2Points.forEach(point => {
            doc.setFillColor(...bulletColor);
            doc.circle(marginLeft, currentY - 3, 2, "F");
            const wrappedLines = doc.splitTextToSize(point, pageWidth - marginLeft * 2 - 20);
            wrappedLines.forEach((line) => {
                doc.text(line, marginLeft + 10, currentY);
                currentY += lineHeight;
            });
        });
        currentY += 15;
    }


    return doc;
}
