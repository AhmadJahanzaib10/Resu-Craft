// ResumeTemplates/Template3.js

import { jsPDF } from "jspdf";

export function generateTemplate3PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Define the left sidebar width
  const sidebarWidth = 200;

  // Colors & Fonts
  const leftBgColor = [238, 244, 255]; // a light bluish color
  const headingColor = [41, 46, 73];   // dark text
  const bodyTextColor = [74, 68, 68];
  const accentColor = [131, 131, 131];

  // 1) Draw the left sidebar background
  doc.setFillColor(...leftBgColor);
  doc.rect(0, 0, sidebarWidth, pageHeight, "F");

  // Margins & positions
  const leftMargin = 20;        // text margin inside the sidebar
  let currentY = 60;            // vertical start in the sidebar
  const contentStartX = sidebarWidth + 40; // main content starts to the right
  const lineHeight = 14;

  // -------------------------------------------
  // LEFT SIDEBAR: Name, Title, Summary, Contact
  // -------------------------------------------
  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...headingColor);
  doc.text(resume.name || "YOUR NAME", leftMargin, currentY);
  currentY += 25;

  // Title or short role
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...accentColor);
  doc.text(resume.workExperience[0]?.jobTitle || "Senior Graphic Designer", leftMargin, currentY);
  currentY += 30;

  // Possibly a short summary or profile statement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);
  const summaryText = resume.summary || "Senior Graphic Designer with X years of experience ...";
  const summaryLines = doc.splitTextToSize(summaryText, sidebarWidth - leftMargin * 2);
  summaryLines.forEach((line) => {
    doc.text(line, leftMargin, currentY);
    currentY += lineHeight;
  });
  currentY += 20;

  // Contact Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...headingColor);
  doc.text("CONTACT", leftMargin, currentY);
  currentY += lineHeight;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...bodyTextColor);
  if (resume.phone) {
    doc.text(resume.phone, leftMargin, currentY);
    currentY += lineHeight;
  }
  if (resume.email) {
    doc.text(resume.email, leftMargin, currentY);
    currentY += lineHeight;
  }
  if (resume.address) {
    const addressLines = doc.splitTextToSize(resume.address, sidebarWidth - leftMargin * 2);
    addressLines.forEach((line) => {
      doc.text(line, leftMargin, currentY);
      currentY += lineHeight;
    });
  }
  if (resume.linkedIn) {
    currentY += lineHeight;
    doc.textWithLink("LinkedIn", leftMargin, currentY, { url: resume.linkedIn });
    currentY += lineHeight;
  }
  currentY += 30;

  // Additional Content? (Languages, References)
  // If you want them in the sidebar, place them here. Otherwise, put them on the right column.
  // Example: show languages in the sidebar:
  if (resume.additionalContent?.languages?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...headingColor);
    doc.text("LANGUAGES", leftMargin, currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...bodyTextColor);
    resume.additionalContent.languages.forEach((lang) => {
      doc.text(`• ${lang}`, leftMargin, currentY);
      currentY += lineHeight;
    });
    currentY += 20;
  }

  // Possibly references in the sidebar as well
  // ...

  // -------------------------------------------
  // RIGHT COLUMN: Professional Experience, Education, Skills
  // -------------------------------------------
  let rightY = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);

  // Professional Experience heading
  doc.text("PROFESSIONAL EXPERIENCE", contentStartX, rightY);
  rightY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  resume.workExperience.forEach((exp) => {
    // e.g. "May 2019 - Present | Senior Graphic Design Specialist"
    const experienceHeader = `${exp.duration || "YYYY - YYYY"} | ${exp.jobTitle || "Job Title"}`;
    doc.setFont("helvetica", "bold");
    doc.text(experienceHeader, contentStartX, rightY);
    rightY += lineHeight;

    // e.g. "Company Name, Location"
    doc.setFont("helvetica", "normal");
    doc.text(exp.company || "Company Name", contentStartX, rightY);
    rightY += lineHeight;

    // Responsibilities
    const respLines = doc.splitTextToSize(
      exp.responsibilities || "Describe your role and achievements...",
      pageWidth - contentStartX - 40
    );
    console.log(respLines)
    respLines.forEach((line, i) => {
      doc.circle(contentStartX, rightY - 4, 2, "F"); // bullet
      doc.text(line, contentStartX + 10, rightY);

      rightY += lineHeight;
    });
    rightY += 15; // extra gap after each job
  });

  // Education
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("EDUCATION", contentStartX, rightY);
  rightY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  resume.education.forEach((edu) => {
    // e.g. "Month 20XX | Bachelor of Fine Arts"
    const eduHeader = `${edu.graduationYear || "Year"} | ${edu.degree || "Degree"}`;
    doc.setFont("helvetica", "bold");
    doc.text(eduHeader, contentStartX, rightY);
    rightY += lineHeight;

    // e.g. "College Name"
    doc.setFont("helvetica", "normal");
    doc.text(edu.school || "College Name", contentStartX, rightY);
    rightY += lineHeight + 10;
  });

  // Skills with "bars" (approximation)
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(12);
  // doc.setTextColor(...headingColor);
  // doc.text("SKILLS", contentStartX, rightY);
  // rightY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  // We'll assume resume.skills is an array of strings, or you might store skill name + proficiency
  // We'll approximate bars by drawing a rect with some fraction filled.
  // const barWidth = 100;
  // resume.skills.slice(0, 5).forEach((skill) => {
  //   // skill can be "JavaScript" or "HTML & CSS"
  //   doc.text(skill, contentStartX, rightY + 10);

  //   // Draw a background bar
  //   doc.setDrawColor(200);
  //   doc.setFillColor(230, 230, 230);
  //   doc.rect(contentStartX + 100, rightY, barWidth, 10, "F");

  //   // You can fill part of the bar to indicate proficiency, e.g. random or a set fraction
  //   // For demonstration, let's fill 60%
  //   doc.setFillColor(41, 46, 73);
  //   doc.rect(contentStartX + 100, rightY, barWidth * 0.6, 10, "F");

  //   rightY += 20;
  // });

  return doc;
}
