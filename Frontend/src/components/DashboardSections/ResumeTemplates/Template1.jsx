import { jsPDF } from "jspdf";

export function generateTemplate1PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginBottom = 30;

  // Colors & Fonts
  const pinkBg = [249, 231, 229];
  const headingColor = [74, 68, 68];
  const bodyTextColor = [74, 68, 68];
  const accentColor = [131, 131, 131];

  // Helper: Redraw the left sidebar (pink background)
  const drawLeftSidebar = (startY = 0) => {
    doc.setFillColor(...pinkBg);
    doc.rect(0, startY, 200, pageHeight - startY, "F");
  };

  // Helper: Check for page break; if exceeded, add a new page and redraw the left sidebar.
  const checkPageBreak = (currentY) => {
    if (currentY > pageHeight - marginBottom) {
      doc.addPage();
      // For a new page, we start the left sidebar at a top margin (say, 40pt)
      drawLeftSidebar(40);
      return 40; // Reset y-position on the new page
    }
    return currentY;
  };

  // -------------------------
  // HEADER: Name and Top Work Experience Job Title
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...headingColor);
  if (resume.photo) {
    // Adjust coordinates and size as needed (here 50x50 at position (margin, 20))
    doc.addImage(resume.photo, "JPEG", 40, 15, 75, 75);
    // Then print the name offset to the right of the image:
    doc.text(resume.name || "YOUR NAME", pageWidth / 2, 60, { align: "center" });
  } else {
    doc.text(resume.name || "YOUR NAME", pageWidth / 2, 60, { align: "center" });
  }

  const topExp = resume.workExperience[0];
  const topTitle = topExp?.jobTitle || "WEB DEVELOPER";
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...accentColor);
  doc.text(topTitle.toUpperCase(), pageWidth / 2, 80, { align: "center" });

  const headerBottom = 100;

  // -------------------------
  // LEFT SIDEBAR: Draw initial pink background
  // -------------------------
  const sidebarWidth = 200;
  const leftContentStartY = headerBottom + 20;
  drawLeftSidebar(leftContentStartY);

  const leftMargin = 30;
  const leftMaxWidth = sidebarWidth - leftMargin * 2;
  let currentY = leftContentStartY + 10; // starting y position inside sidebar
  const gapAfterTitle = 15;

  // --- Section: CONTACT ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text("CONTACT", leftMargin, currentY + 14);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, currentY + 18, leftMargin + leftMaxWidth, currentY + 18);
  currentY += 18 + gapAfterTitle;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...bodyTextColor);
  doc.text("Phone: " + (resume.phone || "N/A"), leftMargin, currentY);
  currentY += 14;
  doc.text("Email: " + (resume.email || "N/A"), leftMargin, currentY);
  currentY += 14;

  // Wrap the address text so that it doesn't exceed leftMaxWidth.
  const address = resume.address || "N/A";
  const addressLines = doc.splitTextToSize("Address: " + address, leftMaxWidth);
  addressLines.forEach((line) => {
    doc.text(line, leftMargin, currentY);
    currentY += 16;
    currentY = checkPageBreak(currentY);
  });
  // Display LinkedIn as a link label.
  doc.textWithLink("LinkedIn", leftMargin, currentY, { url: resume.linkedIn || "https://www.linkedin.com/in/username" });
  currentY += 12;
  currentY = checkPageBreak(currentY);

  // --- Section: EDUCATION ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text("EDUCATION", leftMargin, currentY + 14);
  doc.line(leftMargin, currentY + 18, leftMargin + leftMaxWidth, currentY + 18);
  currentY += 18 + gapAfterTitle;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  resume.education.forEach((edu) => {
    const schoolLines = doc.splitTextToSize(edu.school || "Your School", leftMaxWidth);
    schoolLines.forEach((line) => {
      doc.text(line, leftMargin, currentY);
      currentY += 12;
      currentY = checkPageBreak(currentY);
    });
    const degreeLine = `${edu.degree || "Your Degree"} (${edu.graduationYear || "Year"})`;
    const degreeLines = doc.splitTextToSize(degreeLine, leftMaxWidth);
    degreeLines.forEach((line) => {
      doc.text(line, leftMargin, currentY);
      currentY += 12;
      currentY = checkPageBreak(currentY);
    });
    currentY += 10;
    currentY = checkPageBreak(currentY);
  });

  // --- Section: SKILLS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text("SKILLS", leftMargin, currentY + 14);
  doc.line(leftMargin, currentY + 18, leftMargin + leftMaxWidth, currentY + 18);
  currentY += 18 + gapAfterTitle;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const limitedSkills = resume.skills.slice(0, 5);
  limitedSkills.forEach((skill) => {
    const skillText = "• " + skill;
    const skillLines = doc.splitTextToSize(skillText, leftMaxWidth);
    skillLines.forEach((line) => {
      doc.text(line, leftMargin, currentY);
      currentY += 16;
      currentY = checkPageBreak(currentY);
    });
  });

  // --- Section: ADDITIONAL CONTENT ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text("ADDITIONAL", leftMargin, currentY + 14);
  doc.line(leftMargin, currentY + 18, leftMargin + leftMaxWidth, currentY + 18);
  currentY += 18 + gapAfterTitle;
  
  doc.setFont("helvetica", "normal");
  const { languages, references } = resume.additionalContent;
  if (languages.length > 0) {
    languages.forEach((lang) => {
      doc.text("• " + lang, leftMargin, currentY);
      currentY += 16;
      currentY = checkPageBreak(currentY);
    });
    currentY += 6;
    currentY = checkPageBreak(currentY);
  }
  if (references.length > 0) {
    references.forEach((ref) => {
      doc.text("• " + ref.name + " - " + ref.contact, leftMargin, currentY);
      currentY += 16;
      currentY = checkPageBreak(currentY);
    });
  }

  // -------------------------
  // RIGHT COLUMN: SUMMARY & EXPERIENCE
  // -------------------------
  const rightMargin = 280;
  let rightY = headerBottom + 20;
  const availableRightHeight = pageHeight - rightY - 30;
  const allocatedSummaryHeight = availableRightHeight * 0.25;

  // --- Section: SUMMARY ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text("SUMMARY", rightMargin, rightY + 14);
  doc.line(rightMargin, rightY + 18, pageWidth - 50, rightY + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  rightY += 28 + 5;
  const summaryLines = doc.splitTextToSize(
    resume.summary || "I am a qualified and professional individual...",
    pageWidth - rightMargin - 50
  );
  summaryLines.forEach((line) => {
    doc.text(line, rightMargin, rightY);
    rightY += 16;
    rightY = checkPageBreak(rightY);
  });
  const expectedSummaryY = headerBottom + allocatedSummaryHeight;
  if (rightY < expectedSummaryY) {
    rightY = expectedSummaryY;
  }

  // --- Section: EXPERIENCE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text("EXPERIENCE", rightMargin, rightY + 14);
  doc.line(rightMargin, rightY + 18, pageWidth - 50, rightY + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  rightY += 28 + 5;
  resume.workExperience.forEach((exp) => {
    const jobTitle = exp.jobTitle || "Job Title";
    const company = exp.company || "Company";
    const duration = exp.duration || "2020 - Present";
    const respData = exp.responsibilities;

    doc.setFont("helvetica", "bold");
    doc.text(jobTitle, rightMargin, rightY);
    rightY += 17 + 5;
    doc.setFont("helvetica", "normal");
    doc.text(`${company} | ${duration}`, rightMargin, rightY);
    rightY += 17 + 5;

    let responsibilitiesArray = [];
    if (Array.isArray(respData)) {
      responsibilitiesArray = respData;
    } else if (typeof respData === "string") {
      responsibilitiesArray = respData.includes("\n")
        ? respData.split(/\r?\n/).filter((line) => line.trim() !== "")
        : [respData];
    }
    responsibilitiesArray.forEach((respItem) => {
      const bulletLines = doc.splitTextToSize(respItem, pageWidth - rightMargin - 50);
      bulletLines.forEach((line, index) => {
        if (index === 0) {
          doc.text("- " + line, rightMargin, rightY);
        } else {
          doc.text("  " + line, rightMargin, rightY);
        }
        rightY += 16;
        rightY = checkPageBreak(rightY);
      });
    });
    rightY += 24;
    rightY = checkPageBreak(rightY);
  });

  return doc;
}
