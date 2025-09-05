// ResumeTemplates/Template8.js

import { jsPDF } from "jspdf";

export function generateTemplate7PDF(resume) {
  console.log("resume", resume);
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  // const pageHeight = doc.internal.pageSize.getHeight();

  // Colors & Fonts
  const highlightColor = [66, 133, 99]; // Greenish color for lines and bullets (from Template5)
  const headingColor = [0, 0, 0];       // Black for headings (from Template5)
  const bodyTextColor = [74, 68, 68];   // Dark gray for body text (from Template5)
  const bulletColor = [66, 133, 99];    // Green for bullets (matching the attached template)

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
  // Candidate name
  doc.text(resume.name || "DEBRA NELSON", marginLeft, currentY);
  currentY += 20;

  // Contact Info (single line with separators)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  const contactItems = [];
  if (resume.address) contactItems.push(resume.address);
  else contactItems.push("City, State Abbreviation ZIP Code");
  if (resume.phone) contactItems.push(resume.phone);
  else contactItems.push("(123) 456-7890");
  if (resume.email) contactItems.push(resume.email);
  else contactItems.push("email@example.com");
  if (resume.linkedIn || resume.portfolio) {
    const links = [];
    if (resume.linkedIn) links.push("LinkedIn");
    if (resume.portfolio) links.push("Portfolio");
    contactItems.push(links.join(" | "));
  } else {
    contactItems.push("LinkedIn | Portfolio");
  }

  const contactLine = contactItems.join(" | ");
  const contactLines = doc.splitTextToSize(contactLine, pageWidth - marginLeft * 2);
  contactLines.forEach((line) => {
    doc.text(line, marginLeft, currentY);
    currentY += lineHeight;
  });
  currentY += 10;

  // -------------------------
  // SUMMARY
  // -------------------------
  // Horizontal line
  doc.setDrawColor(...highlightColor);
  doc.setLineWidth(2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += sectionGap;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("SUMMARY", marginLeft, currentY); // Renamed to match the attached template
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  const summaryText =
    resume.summary ||
    "Results-driven bank teller with more than 10 years of experience, excelling in customer relations, institutional banking, and commercial finance. Recognized for effectively delivering banking solutions that help clients meet their financial aspirations. Bachelor of Science in Accounting.";
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - marginLeft * 2);
  summaryLines.forEach((line) => {
    doc.text(line, marginLeft, currentY);
    currentY += lineHeight;
  });
  currentY += sectionGap;

  // -------------------------
  // EDUCATION
  // -------------------------
  doc.setDrawColor(...highlightColor);
  doc.setLineWidth(2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += sectionGap;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("EDUCATION", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  if (resume.education && resume.education.length > 0) {
    resume.education.forEach((edu) => {
      // Degree and institution on one line
      const eduLine = `${edu.degree || "Degree"} | ${edu.school || "University Name, City, State"}`;
      doc.setFont("helvetica", "bold");
      doc.text(eduLine, marginLeft, currentY);
      currentY += lineHeight;

      const eduLine2 = `${edu.school || "University Name, City, State"}`;
      doc.setFont("helvetica", "bold");
      doc.text(eduLine2, marginLeft, currentY);
      currentY += lineHeight;

      // Dates on the next line
      doc.setFont("helvetica", "normal");
      const dateLine = `${edu.startDate || ""} - ${edu.endDate || ""}`;
      doc.text(dateLine, marginLeft, currentY);
      currentY += lineHeight + 15;
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.text("Bachelor of Science in Accounting | BOSTON UNIVERSITY, Boston, MA", marginLeft, currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.text("August 2010 - May 2015", marginLeft, currentY);
    currentY += lineHeight + 15;
  }

  // -------------------------
  // EXPERIENCE
  // -------------------------
  doc.setDrawColor(...highlightColor);
  doc.setLineWidth(2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += sectionGap;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("EXPERIENCE", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  if (resume.workExperience && resume.workExperience.length > 0) {
    resume.workExperience.forEach((exp) => {
      // Job title and company on one line
      const titleLine = `${exp.jobTitle || "Job Title"} | ${exp.company || "Company Name, City, State"}`;
      doc.setFont("helvetica", "bold");
      doc.text(titleLine, marginLeft, currentY);
      currentY += lineHeight;

      // Dates on the next line
      doc.setFont("helvetica", "normal");
      const dateLine = `${exp.startDate || ""} - ${exp.endDate || ""}`;
      doc.text(dateLine, marginLeft, currentY);
      currentY += lineHeight + 5;

      // Responsibilities in bullet points
      let respPoints = [];
      if (exp.responsibilities) {
        if (typeof exp.responsibilities === 'string') {
          // Split by common delimiters or sentences
          respPoints = exp.responsibilities.split(/[•\-\.\;\,]\s+/).filter(point => point.trim().length > 0);
          if (respPoints.length <= 1) {
            respPoints = exp.responsibilities.split(/\.\s+/).filter(point => point.trim().length > 0);
          }
        } else if (Array.isArray(exp.responsibilities)) {
          respPoints = exp.responsibilities;
        }
      }

      respPoints.forEach(point => {
        if (point.trim()) {
          doc.setFillColor(...bulletColor);
          doc.circle(marginLeft, currentY - 3, 2, "F"); // Green bullet
          const bulletPoint = point.trim();
          const wrappedLines = doc.splitTextToSize(bulletPoint, pageWidth - marginLeft * 2 - 20);
          wrappedLines.forEach((line, i) => {
            doc.text(line, marginLeft + 10, currentY);
            currentY += lineHeight;
          });
        }
      });
      currentY += 15;
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

  // -------------------------
  // PROFESSIONAL SKILLS
  // -------------------------
  doc.setDrawColor(...highlightColor);
  doc.setLineWidth(2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += sectionGap;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...headingColor);
  doc.text("PROFESSIONAL SKILLS", marginLeft, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...bodyTextColor);

  resume.skills.forEach((skill) => {
    doc.setFillColor(...bulletColor);
    doc.circle(marginLeft, currentY - 3, 2, "F");
    doc.text(skill, marginLeft + 10, currentY);
    currentY += lineHeight;
  });

  return doc;
}