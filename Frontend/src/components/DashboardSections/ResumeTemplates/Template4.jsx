// ResumeTemplates/Template4.js

import { jsPDF } from "jspdf";

export function generateTemplate4PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  // const pageHeight = doc.internal.pageSize.getHeight();

  // Colors & Fonts
  const headingColor = [41, 46, 73];   // dark text
  const bodyTextColor = [74, 68, 68];
  const accentColor = [131, 131, 131];

  // Basic positions and spacing
  const marginLeft = 40;
  let currentY = 70;  // starting Y position
  const lineHeight = 14;

  // -------------------------
  // HEADER: Name, Contact Info, Title
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...headingColor);
  // Name
  doc.text(resume.name || "LAUREN CHEN", marginLeft, currentY);
  currentY += 25;

  // Contact info on the right side: phone, email, LinkedIn
  // For example, put them in a single line at the top-right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);
  const rightX = pageWidth - marginLeft - 200; // rough positioning

  // phone
  if (resume.phone) {
    doc.text(resume.phone, rightX, 50);
  }
  // email
  if (resume.email) {
    doc.text(resume.email, rightX, 65);
  }
  // LinkedIn
  if (resume.linkedIn) {
    doc.setTextColor(66, 133, 244); // a link color
    doc.textWithLink(resume.linkedIn, rightX, 80, { url: resume.linkedIn });
    doc.setTextColor(...bodyTextColor);
  }

  // Title (e.g. "Digital Marketing Specialist") or use first job title
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...accentColor);
  const topExpTitle = resume.workExperience[0]?.jobTitle || "Digital Marketing Specialist";
  doc.text(topExpTitle, marginLeft, currentY);
  currentY += 25;

  // -------------------------
  // SUMMARY
  // -------------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);
  const summary = resume.summary || 
    "Digital Marketing Specialist with 4+ years of experience in online marketing, branding, and business strategy...";
  const summaryLines = doc.splitTextToSize(summary, pageWidth - marginLeft * 2);
  summaryLines.forEach((line) => {
    doc.text(line, marginLeft, currentY);
    currentY += lineHeight;
  });
  currentY += 20;

  // -------------------------
  // RELEVANT SKILLS (pills)
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("RELEVANT SKILLS", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  // We'll place each skill in a "pill." For simplicity, we just draw a rounded rect behind each skill text.
  // We'll assume resume.skills is an array of strings. If empty, use sample data.
  const skillList = resume.skills.length > 0 ? resume.skills : 
    ["Digital Data Analytics/Marketing", "Adobe Photoshop", "Adobe Illustrator", "Google Analytics", "HTML & CSS"];
  
  let currentX = marginLeft;
  const pillHeight = 18;
  const maxPillWidth = pageWidth - marginLeft * 2;
  skillList.forEach((skill) => {
    const skillWidth = doc.getTextWidth(skill) + 20; // 10px padding on each side
    if (currentX + skillWidth > maxPillWidth) {
      // move to next line
      currentX = marginLeft;
      currentY += 25;
    }
    // draw a rounded rect
    doc.setDrawColor(220);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(currentX, currentY - pillHeight + 2, skillWidth, pillHeight, 8, 8, "F");
    doc.setTextColor(...bodyTextColor);
    doc.text(skill, currentX + 10, currentY - 4); 
    currentX += skillWidth + 10;
  });
  currentY += 30;

  // -------------------------
  // PROFESSIONAL EXPERIENCE
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("PROFESSIONAL EXPERIENCE", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  // For each experience, date on the right, job title, company, responsibilities
  resume.workExperience.forEach((exp) => {
    // e.g. "May 2019 - Present" on the right
    if (exp.duration) {
      doc.text(exp.duration, pageWidth - marginLeft - 120, currentY); 
    }
    // Job Title
    doc.setFont("helvetica", "bold");
    doc.text(exp.jobTitle || "Job Title", marginLeft, currentY);
    currentY += lineHeight + 5; // Added 5pt extra spacing after job title
    
    // Company
    doc.setFont("helvetica", "normal");
    doc.text(exp.company || "Company, City, State", marginLeft, currentY);
    currentY += lineHeight + 8; // Added 8pt extra spacing after company
    
    // Responsibilities
    const respLines = doc.splitTextToSize(
      exp.responsibilities || "Describe achievements, tasks, etc...",
      pageWidth - marginLeft * 2
    );
    respLines.forEach((line) => {
      doc.circle(marginLeft, currentY - 4, 2, "F"); // bullet
      doc.text(line, marginLeft + 10, currentY);
      currentY += lineHeight;
    });
    currentY += 25; // Increased from 15 to 25 for more space between experiences
  });

  // -------------------------
  // EDUCATION
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("EDUCATION", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  resume.education.forEach((edu) => {
    // Graduation year on the right
    if (edu.graduationYear) {
      doc.text(edu.graduationYear, pageWidth - marginLeft - 120, currentY);
    }
    // Degree
    doc.setFont("helvetica", "bold");
    doc.text(edu.degree || "Bachelor of Arts, Communications", marginLeft, currentY);
    currentY += lineHeight;

    // School
    doc.setFont("helvetica", "normal");
    doc.text(edu.school || "University Name, City, State", marginLeft, currentY);
    currentY += lineHeight + 10;
  });

  return doc;
}
