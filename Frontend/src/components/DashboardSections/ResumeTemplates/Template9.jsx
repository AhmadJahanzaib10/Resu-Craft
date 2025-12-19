import { jsPDF } from "jspdf";

/**
 * Draw right-aligned, wrapped text within a fixed width.
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} text - Text to draw
 * @param {number} rightX - Right edge of the text (anchor)
 * @param {number} leftX - Left boundary (max left)
 * @param {number} startY - Starting Y position
 * @param {number} lineHeight - Height between lines
 * @param {number} letterSpacing - Optional letter spacing
 * @returns {number} - Total height used
 */
function drawRightAlignedBlock(doc, text, rightX, leftX, y, lineHeight = 14) {
  if (!text) return 0;

  const maxWidth = rightX - leftX;

  doc.text(text, rightX, y, {
    maxWidth,
    align: "right",
    lineHeightFactor: lineHeight / doc.getFontSize()
  });

  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * lineHeight;
}




function drawSpacedText(doc, text, x, y, spacing = 1, options = {}) {
  let cursorX = x;

  if (options.align === "right") {
    const textWidth =
      (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    cursorX = x - textWidth - spacing * (text.length - 1);
  }

  for (let i = 0; i < text.length; i++) {
    doc.text(text[i], cursorX, y);
    cursorX +=
      (doc.getStringUnitWidth(text[i]) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor +
      spacing;
  }
}


export function generateTemplate9PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors & Fonts
  const highlightColor = [222, 222, 222]; // Greenish color for lines and bullets (from Template5)
  const headingColor = [0, 0, 0];       // Black for headings (from Template5)
  const bodyTextColor = [74, 68, 68];   // Dark gray for body text (from Template5)
  const bulletColor = [0, 0, 0];   // Green for bullets (matching the attached template)

  // Define Left columns
  const leftColumnWidth = pageWidth / 2 - 140; // Further reduced width to prevent overlap

  // Margins & positions
  let currentY = 50;
  const leftMargin = 40; // Moved left margin more to the left
  let leftY = 80;  // starting Y position for left column
  let rightY = 80; // starting Y position for right column
  const lineHeight = 18;
  const sectionGap = 25; // Reduced section gap

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
  currentY += 50;

  // Draw a vertical line between left and right columns
  doc.setDrawColor(...highlightColor); // Light gray color
  doc.setLineWidth(2);
  // Moved the vertical divider line slightly left to create more space for right column
  const dividerPosition = pageWidth / 2 - 80;
  doc.line(dividerPosition, currentY, dividerPosition, pageHeight - 40);

  // Contact Information 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);
  const leftColumnRightEdge = leftMargin + leftColumnWidth;

  // Contact Heading
  drawSpacedText(
    doc,
    "CONTACT",
    leftColumnRightEdge,
    currentY + 10,
    1.5, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 20;

  // Horizontal Line
  doc.setDrawColor(...highlightColor); // set color
  doc.setLineWidth(2);                 // thickness
  doc.line(leftMargin, currentY, leftColumnRightEdge, currentY); // from left margin to right margin
  currentY += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  // Email Address
  drawSpacedText(
    doc,
    resume.email,
    leftColumnRightEdge,
    currentY + 10,
    1, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 15;

  // Phone Number
  drawSpacedText(
    doc,
    resume.phone,
    leftColumnRightEdge,
    currentY + 10,
    1, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 15;

  currentY += drawRightAlignedBlock(
    doc,
    resume.address,
    leftColumnRightEdge, // SAME edge as email & phone
    leftMargin,          // SAME left boundary as line
    currentY + 10,
    14
  );

  currentY += sectionGap + 10;


  // Education Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);

  drawSpacedText(
    doc,
    "EDUCATION",
    leftColumnRightEdge,
    currentY + 10,
    1.5, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 20;

  doc.setDrawColor(...highlightColor); // set color
  doc.setLineWidth(2);                 // thickness
  doc.line(leftMargin, currentY, leftColumnRightEdge, currentY); // for Left Column
  currentY += 15;

  //Education Content
  resume.education.forEach((edu) => {
    // Degree (Bold, size 10)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...headingColor);
    doc.setFontSize(10);

    drawSpacedText(
      doc,
      edu.degree,
      leftColumnRightEdge,
      currentY + 10,
      0.5,
      { align: "right" }
    );

    currentY += 15;

    // School + Graduation Year (Normal, size 9)
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...bodyTextColor);
    doc.setFontSize(10);

    drawSpacedText(
      doc,
      edu.school,
      leftColumnRightEdge,
      currentY + 10,
      0.5,
      { align: "right" }
    );

    currentY += 15;

    drawSpacedText(
      doc,
      edu.graduationYear,
      leftColumnRightEdge,
      currentY + 10,
      0.5,
      { align: "right" }
    );

    currentY += 20;

  });

  currentY += 10;

  // Skills Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);

  drawSpacedText(
    doc,
    "SKILLS",
    leftColumnRightEdge,
    currentY + 10,
    1.5, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 20;

  doc.setDrawColor(...highlightColor); // set color
  doc.setLineWidth(2);                 // thickness
  doc.line(leftMargin, currentY, leftColumnRightEdge, currentY); // for Left Column
  currentY += 15;

  // Skills Section

  resume.skills.forEach((skill) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...bodyTextColor);
    drawSpacedText(
      doc,
      skill,
      leftColumnRightEdge,
      currentY + 10,
      1.5, // letter spacing (adjust if needed)
      { align: "right" }
    );
    currentY += 15;
  })

  currentY += 15;

  if( resume.additionalContent?.languages &&
    resume.additionalContent.languages.length > 0){
    // Languages Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);

  drawSpacedText(
    doc,
    "LANGUAGES",
    leftColumnRightEdge,
    currentY + 10,
    1.5, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 20;

  doc.setDrawColor(...highlightColor); // set color
  doc.setLineWidth(2);                 // thickness
  doc.line(leftMargin, currentY, leftColumnRightEdge, currentY); // for Left Column
  currentY += 15;

  // Languages Section

  resume.additionalContent.languages.forEach((lang) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...bodyTextColor);
    drawSpacedText(
      doc,
      lang,
      leftColumnRightEdge,
      currentY + 10,
      1.5, // letter spacing (adjust if needed)
      { align: "right" }
    );
    currentY += 15;
  })
  }
  currentY += 15;

  if( resume.additionalContent?.references &&
    resume.additionalContent.references.length > 0){
    // References Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);

  drawSpacedText(
    doc,
    "REFERENCES",
    leftColumnRightEdge,
    currentY + 10,
    1.5, // letter spacing (adjust if needed)
    { align: "right" }
  );

  currentY += 20;

  doc.setDrawColor(...highlightColor); // set color
  doc.setLineWidth(2);                 // thickness
  doc.line(leftMargin, currentY, leftColumnRightEdge, currentY); // for Left Column
  currentY += 15;

  // References Section

  resume.additionalContent.references.forEach((ref) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...bodyTextColor);
    drawSpacedText(
      doc,
      ref.name,
      leftColumnRightEdge,
      currentY + 10,
      1.5, // letter spacing (adjust if needed)
      { align: "right" }
    );
    currentY += 15;
    drawSpacedText(
      doc,
      ref.contact,
      leftColumnRightEdge,
      currentY + 10,
      1.5, // letter spacing (adjust if needed)
      { align: "right" }
    );
    currentY += 10;
  })
  }

  const rightColumnStartX = dividerPosition + 30; // padding from divider
  const rightColumnRightEdge = pageWidth - 40;    // right page margin
  const rightColumnWidth = rightColumnRightEdge - rightColumnStartX; // Define Right Column
  currentY = 110;

  // Summary Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);

  drawSpacedText(
    doc,
    "SUMMARY",
    rightColumnStartX,
    currentY,
    1.5 // letter spacing
  );

  currentY += 10;

  doc.setDrawColor(...highlightColor);
  doc.setLineWidth(2);
  doc.line(
    rightColumnStartX,
    currentY,
    rightColumnRightEdge,
    currentY
  );

  currentY += 25;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  const summaryText = resume.summary || "";
  const lineSpacing = 15; // 🔹 adjust this for more/less space

  const summaryLines = doc.splitTextToSize(
    summaryText,
    rightColumnWidth
  );

  summaryLines.forEach((line, index) => {
    doc.text(
      line,
      rightColumnStartX,
      currentY + index * lineSpacing
    );
  });

  // Move cursor after summary block
  currentY += (summaryLines.length * lineSpacing) + 20 ;

   // Experience Heading
   doc.setFont("helvetica", "bold");
   doc.setFontSize(11);
   doc.setTextColor(...headingColor);
 
   drawSpacedText(
     doc,
     "PROFESSIONAL EXPERIENCE",
     rightColumnStartX,
     currentY,
     1.5 // letter spacing
   );
 
   currentY += 10;
 
   doc.setDrawColor(...highlightColor);
   doc.setLineWidth(2);
   doc.line(
     rightColumnStartX,
     currentY,
     rightColumnRightEdge,
     currentY
   );
 
   currentY += 25;

   resume.workExperience.forEach((exp) => {

    // 1️⃣ Job Title (Bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...headingColor);
  
    doc.text(
      exp.jobTitle,
      rightColumnStartX,
      currentY
    );
  
    currentY += 16;
  
    // 2️⃣ Company / Dates (Normal)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...bodyTextColor);
  
    const companyLine = `${exp.company} / ${exp.startDate} - ${exp.endDate}`;
  
    doc.text(
      companyLine,
      rightColumnStartX,
      currentY
    );
  
    currentY += 18;
  
    // 3️⃣ Responsibilities (Bulleted)
    const bullets = (exp.responsibilities || "").split("\n");
  
    bullets.forEach((point) => {
      if (!point.trim()) return;
  
      const bulletX = rightColumnStartX;
      const textX = rightColumnStartX + 10;
      const bulletWidth = rightColumnWidth - 10;
  
      // Bullet dot
      doc.setFontSize(10);
      doc.text("•", bulletX, currentY);
  
      // Wrapped bullet text
      const wrappedLines = doc.splitTextToSize(
        point,
        bulletWidth
      );
  
      wrappedLines.forEach((line, i) => {
        doc.text(
          line,
          textX,
          currentY + i * 14
        );
      });
  
      currentY += wrappedLines.length * 14 + 4;
    });
  
    currentY += 5; // space between experiences
  });

  return doc;
}
