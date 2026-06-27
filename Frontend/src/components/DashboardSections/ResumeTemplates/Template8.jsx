import { jsPDF } from "jspdf";

export function generateTemplate8PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const highlightColor = [0, 0, 0];
  const headingColor = [0, 0, 0];
  const bodyTextColor = [74, 68, 68];
  const bulletColor = [0, 0, 0];

  const marginLeft = 50;
  let currentY = 50;
  const lineHeight = 14;
  const sectionGap = 20;

  const checkPageBreak = (y, needed = 20) => {
    if (y + needed > pageHeight - 40) {
      doc.addPage();
      return 50;
    }
    return y;
  };

  const drawSectionHeader = (title) => {
    currentY = checkPageBreak(currentY, 50);
    doc.setDrawColor(...highlightColor);
    doc.setLineWidth(1);
    doc.line(50, currentY, pageWidth - 50, currentY);
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...headingColor);
    doc.text(title, marginLeft, currentY + 10);
    currentY += 20;
    doc.setDrawColor(...highlightColor);
    doc.setLineWidth(1);
    doc.line(50, currentY, pageWidth - 50, currentY);
    currentY += 20;
  };

  // -------------------------
  // HEADER
  // -------------------------
  if (resume.name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...headingColor);
    const textWidth =
      (doc.getStringUnitWidth(resume.name) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const xCentered = (pageWidth - textWidth) / 2;
    doc.text(resume.name, xCentered, currentY);
    currentY += 25;
  }

  // Contact line
  const contactParts = [resume.address, resume.email, resume.phone].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);
    const contactInfo = contactParts.join(" | ");
    const maxWidth = pageWidth - marginLeft * 2;
    const wrappedContact = doc.splitTextToSize(contactInfo, maxWidth);
    wrappedContact.forEach((line) => {
      const contactX = (pageWidth - doc.getTextWidth(line)) / 2;
      doc.text(line, contactX, currentY);
      currentY += lineHeight;
    });
  }
  currentY += sectionGap;

  // -------------------------
  // SUMMARY
  // -------------------------
  if (resume.summary) {
    drawSectionHeader("SUMMARY");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);
    const wrappedSummary = doc.splitTextToSize(
      resume.summary,
      pageWidth - marginLeft * 2
    );
    wrappedSummary.forEach((line) => {
      currentY = checkPageBreak(currentY);
      doc.text(line, marginLeft, currentY);
      currentY += lineHeight;
    });
    currentY += sectionGap;
  }

  // -------------------------
  // EDUCATION
  // -------------------------
  if (resume.education && resume.education.length > 0) {
    drawSectionHeader("EDUCATION");

    resume.education.forEach((edu) => {
      currentY = checkPageBreak(currentY, 60);

      const eduLine = `${edu.degree || ""} | ${edu.school || ""}`;
      const wrappedEdu = doc.splitTextToSize(eduLine, pageWidth - marginLeft * 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...headingColor);
      wrappedEdu.forEach((line) => {
        currentY = checkPageBreak(currentY);
        doc.text(line, marginLeft, currentY);
        currentY += lineHeight + 2;
      });

      if (edu.graduationYear) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...bodyTextColor);
        currentY = checkPageBreak(currentY);
        doc.text(edu.graduationYear, marginLeft, currentY);
        currentY += lineHeight + 4;
      }

      // Grade info
      if (edu.gradeType && (edu.gradeValue || edu.obtainedMarks)) {
        let gradeText = "";
        if (edu.gradeType === "cgpa" && edu.gradeValue) {
          gradeText = `CGPA: ${edu.gradeValue}/${edu.totalMarks || "4.0"}`;
        } else if (edu.gradeType === "percentage") {
          if (edu.obtainedMarks && edu.totalMarks) {
            const pct = ((edu.obtainedMarks / edu.totalMarks) * 100).toFixed(1);
            gradeText = `Marks: ${edu.obtainedMarks}/${edu.totalMarks} (${pct}%)`;
          } else if (edu.gradeValue) {
            gradeText = `${edu.gradeValue}%`;
          }
        } else if (edu.gradeType === "grades" && edu.gradeValue) {
          gradeText = `Grade: ${edu.gradeValue}`;
        }

        if (gradeText) {
          doc.setFontSize(10);
          doc.setTextColor(130, 130, 130);
          currentY = checkPageBreak(currentY);
          doc.text(gradeText, marginLeft, currentY);
          doc.setFontSize(12);
          doc.setTextColor(...bodyTextColor);
          currentY += lineHeight;
        }
      }

      currentY += 10;
    });
  }

  // -------------------------
  // SKILLS
  // -------------------------
  if (resume.skills && resume.skills.length > 0) {
    drawSectionHeader("SKILLS");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    const usableWidth = pageWidth - marginLeft * 2;
    const columnWidth = usableWidth / 2;
    const col1X = marginLeft;
    const col2X = marginLeft + columnWidth;
    let xPos = col1X;
    let colCount = 0;

    resume.skills.forEach((skill) => {
      currentY = checkPageBreak(currentY);
      doc.setFillColor(...bulletColor);
      doc.circle(xPos + 20, currentY - 4, 2, "F");
      doc.text(skill, xPos + 25, currentY);
      colCount++;
      if (colCount % 2 === 0) {
        currentY += 20;
        xPos = col1X;
      } else {
        xPos = col2X;
      }
    });
    if (colCount % 2 !== 0) currentY += 20;
    currentY += 10;
  }

  // -------------------------
  // EXPERIENCE
  // -------------------------
  if (resume.workExperience && resume.workExperience.length > 0) {
    drawSectionHeader("EXPERIENCE");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    resume.workExperience.forEach((exp) => {
      currentY = checkPageBreak(currentY, 40);

      const titleLine = `${exp.jobTitle || ""} | ${exp.company || ""}`;
      const dateLine = `${exp.startDate || ""} - ${exp.endDate || ""}`;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...headingColor);

      const dateWidth = doc.getTextWidth(dateLine);
      const rightAlignedX = pageWidth - marginLeft - dateWidth;
      const wrappedTitle = doc.splitTextToSize(
        titleLine,
        pageWidth - marginLeft * 2 - dateWidth - 20
      );

      wrappedTitle.forEach((line, i) => {
        currentY = checkPageBreak(currentY);
        doc.text(line, marginLeft, currentY);
        if (i === 0 && dateLine.trim()) doc.text(dateLine, rightAlignedX, currentY);
        currentY += lineHeight + 5;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...bodyTextColor);

      let respPoints = [];
      if (exp.responsibilities) {
        if (typeof exp.responsibilities === "string") {
          respPoints = exp.responsibilities
            .split(/\r?\n/)
            .filter((p) => p.trim().length > 0);
        } else if (Array.isArray(exp.responsibilities)) {
          respPoints = exp.responsibilities.flatMap((item) =>
            item.split(/\r?\n/).filter((p) => p.trim().length > 0)
          );
        }
      }

      respPoints.forEach((point) => {
        if (point.trim()) {
          const wrappedLines = doc.splitTextToSize(
            point.trim(),
            pageWidth - marginLeft * 2 - 20
          );
          wrappedLines.forEach((line, i) => {
            currentY = checkPageBreak(currentY);
            doc.setFillColor(...bulletColor);
            if (i === 0) {
              doc.circle(marginLeft + 20, currentY - 4, 2, "F");
              doc.text(line, marginLeft + 30, currentY);
            } else {
              doc.text(line, marginLeft + 10, currentY);
            }
            currentY += lineHeight;
          });
        }
      });
      currentY += 10;
    });
  }

  // -------------------------
  // LANGUAGES
  // -------------------------
  if (
    resume.additionalContent?.languages &&
    resume.additionalContent.languages.length > 0
  ) {
    drawSectionHeader("LANGUAGES");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    const usableWidth = pageWidth - marginLeft * 2;
    const columnWidth = usableWidth / 2;
    const col1X = marginLeft;
    const col2X = marginLeft + columnWidth;
    let xPos = col1X;
    let colCount = 0;

    resume.additionalContent.languages.forEach((lang) => {
      currentY = checkPageBreak(currentY);
      doc.setFillColor(...bulletColor);
      doc.circle(xPos + 20, currentY - 4, 2, "F");
      doc.text(lang, xPos + 25, currentY);
      colCount++;
      if (colCount % 2 === 0) {
        currentY += 20;
        xPos = col1X;
      } else {
        xPos = col2X;
      }
    });
    if (colCount % 2 !== 0) currentY += 20;
    currentY += 10;
  }

  // -------------------------
  // REFERENCES
  // -------------------------
  if (
    resume.additionalContent?.references &&
    resume.additionalContent.references.length > 0
  ) {
    drawSectionHeader("REFERENCES");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    resume.additionalContent.references.forEach((ref) => {
      currentY = checkPageBreak(currentY, 40);

      if (ref.name) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...headingColor);
        currentY = checkPageBreak(currentY);
        doc.text(ref.name, marginLeft, currentY);
        currentY += lineHeight + 2;
      }

      if (ref.contact) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...bodyTextColor);
        const wrappedContact = doc.splitTextToSize(
          ref.contact,
          pageWidth - marginLeft * 2
        );
        wrappedContact.forEach((line) => {
          currentY = checkPageBreak(currentY);
          doc.text(line, marginLeft, currentY);
          currentY += lineHeight;
        });
      }

      currentY += 10;
    });
  }

  // -------------------------
  // DISTINCTIONS
  // -------------------------
  if (resume.distinctions && resume.distinctions.length > 0) {
    drawSectionHeader("DISTINCTIONS");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyTextColor);

    resume.distinctions.forEach((dist) => {
      if (!dist.title) return;
      const line = dist.year ? `${dist.title} (${dist.year})` : dist.title;
      const wrappedLines = doc.splitTextToSize(
        line,
        pageWidth - marginLeft * 2 - 20
      );
      wrappedLines.forEach((l, i) => {
        currentY = checkPageBreak(currentY);
        doc.setFillColor(...bulletColor);
        if (i === 0) {
          doc.circle(marginLeft + 20, currentY - 4, 2, "F");
          doc.text(l, marginLeft + 30, currentY);
        } else {
          doc.text(l, marginLeft + 10, currentY);
        }
        currentY += lineHeight;
      });
      currentY += 4;
    });
  }

  return doc;
}