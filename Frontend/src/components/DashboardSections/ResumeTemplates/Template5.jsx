// ResumeTemplates/Template5.js

import { jsPDF } from "jspdf";

export function generateTemplate5PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  // const pageHeight = doc.internal.pageSize.getHeight();

  // Colors & Fonts
  const highlightColor = [66, 133, 99]; // a greenish color
  const headingColor = [0, 0, 0];       // black
  const bodyTextColor = [74, 68, 68];
  const accentColor = [131, 131, 131];

  // Basic positions and spacing
  const marginLeft = 50;
  let currentY = 70;  // starting Y position
  const lineHeight = 14;

  // -------------------------
  // HEADER: Name, Title
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...highlightColor);
  // Candidate name
  doc.text(resume.name || "NELLY SMITH", marginLeft, currentY);
  currentY += 30;

  // Title / job role
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  // We can use first job title or a stored title
  const jobTitle = resume.workExperience[0]?.jobTitle || "Graphic Designer";
  doc.text(jobTitle, marginLeft, currentY);
  currentY += 30;

  // -------------------------
  // CONTACT: phone, address, email, website, LinkedIn
  // We'll place them in one or two lines
  // -------------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  // Build an array of contact items
  // For example: phone, address, email, LinkedIn, website
  const contactItems = [];
  if (resume.phone) contactItems.push(resume.phone);
  if (resume.address) contactItems.push(resume.address);
  if (resume.email) contactItems.push(resume.email);
  if (resume.linkedIn) contactItems.push(`LinkedIn: ${resume.linkedIn}`);
  // If you have a separate website field, you can push that too:
  // if (resume.website) contactItems.push(`Website: ${resume.website}`);

  const contactLine = contactItems.join(" | ");
  // We can split if it's too long, but let's just do one line for simplicity
  doc.text(contactLine, marginLeft, currentY);
  currentY += 30;

  // -------------------------
  // PROFESSIONAL SUMMARY
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("PROFESSIONAL SUMMARY", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  const summaryText =
    resume.summary ||
    "Graphic Design Specialist with X+ years of experience... (sample summary text).";
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - marginLeft * 2);
  summaryLines.forEach((line) => {
    doc.text(line, marginLeft, currentY);
    currentY += lineHeight;
  });
  currentY += 20;

  // -------------------------
  // EXPERIENCE
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("EXPERIENCE", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  resume.workExperience.forEach((exp) => {
    // e.g. "Senior Graphic Design Specialist   20XX to Present"
    const titleLine = `${exp.jobTitle || "Job Title"}   ${exp.duration || "YYYY to YYYY"}`;
    doc.setFont("helvetica", "bold");
    doc.text(titleLine, marginLeft, currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.text(exp.company || "Company Name, City, State", marginLeft, currentY);
    currentY += lineHeight;

    // Add a small line break after company name
    currentY += 5;

    // Responsibilities in bullet points
    // We'll split by newline or just treat the entire string as one bullet
    const respText =
      exp.responsibilities ||
      "List of achievements, responsibilities, etc. Use bullet points or paragraphs...";
    const bulletLines = doc.splitTextToSize(respText, pageWidth - marginLeft * 2 - 20);
    bulletLines.forEach((line, i) => {
      doc.circle(marginLeft, currentY - 3, 2, "F"); // bullet
      doc.text(line, marginLeft + 10, currentY);
      currentY += lineHeight;
    });
    currentY += 15;
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
    // e.g. "Bachelor of Arts, Communications   20XX"
    const eduLine = `${edu.degree || "Degree"}, ${edu.graduationYear || "YYYY"}`;
    doc.setFont("helvetica", "bold");
    doc.text(eduLine, marginLeft, currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.text(edu.school || "University Name, City, State", marginLeft, currentY);
    currentY += lineHeight + 15;
  });

  // -------------------------
  // SKILLS
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("SKILLS", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  // If resume.skills is an array of strings
  const skillArray = resume.skills.length > 0 ? resume.skills : ["Photoshop", "Illustrator", "InDesign"];
  skillArray.forEach((skill) => {
    // bullet each skill
    doc.circle(marginLeft, currentY - 3, 2, "F");
    doc.text(skill, marginLeft + 10, currentY);
    currentY += lineHeight;
  });

  return doc;
}
