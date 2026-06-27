import { jsPDF } from "jspdf";

function drawRightAlignedBlock(doc, text, rightX, leftX, y, lineHeight = 14) {
  if (!text) return 0;
  const maxWidth = rightX - leftX;
  doc.text(text, rightX, y, {
    maxWidth,
    align: "right",
    lineHeightFactor: lineHeight / doc.getFontSize(),
  });
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * lineHeight;
}

function drawSpacedText(doc, text, x, y, spacing = 1, options = {}) {
  if (!text) return;
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

function drawLeftColText(
  doc, text, rightX, leftX, y, fontSize, fontStyle, color, lineHeight = 14
) {
  if (!text) return 0;
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", fontStyle);
  doc.setTextColor(...color);
  return drawRightAlignedBlock(doc, text, rightX, leftX, y, lineHeight);
}

export function generateTemplate9PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const highlightColor = [222, 222, 222];
  const headingColor = [0, 0, 0];
  const bodyTextColor = [74, 68, 68];

  const leftMargin = 40;
  const leftColumnWidth = pageWidth / 2 - 140;
  const leftColumnRightEdge = leftMargin + leftColumnWidth;
  const sectionGap = 25;

  const dividerPosition = pageWidth / 2 - 80;
  const rightColumnStartX = dividerPosition + 30;
  const rightColumnRightEdge = pageWidth - 40;
  const rightColumnWidth = rightColumnRightEdge - rightColumnStartX;

  let currentY = 50;
  let leftColY = 0;
  let rightColY = 0;

  // Track total pages used by left column
  let leftColumnPages = 1;

  const checkLeftPageBreak = (y, needed = 20) => {
    if (y + needed > pageHeight - 40) {
      leftColumnPages++;
      doc.addPage();
      doc.setDrawColor(...highlightColor);
      doc.setLineWidth(2);
      doc.line(dividerPosition, 40, dividerPosition, pageHeight - 40);
      return 60;
    }
    return y;
  };

  const checkRightPageBreak = (y, needed = 20) => {
    if (y + needed > pageHeight - 40) {
      doc.addPage();
      doc.setDrawColor(...highlightColor);
      doc.setLineWidth(2);
      doc.line(dividerPosition, 40, dividerPosition, pageHeight - 40);
      return 60;
    }
    return y;
  };

  const drawLeftSectionHeading = (title, y) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...headingColor);
    drawSpacedText(doc, title, leftColumnRightEdge, y + 10, 1.5, { align: "right" });
    y += 20;
    doc.setDrawColor(...highlightColor);
    doc.setLineWidth(2);
    doc.line(leftMargin, y, leftColumnRightEdge, y);
    y += 15;
    return y;
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
  }
  currentY += 50;

  // Draw divider on page 1
  doc.setDrawColor(...highlightColor);
  doc.setLineWidth(2);
  doc.line(dividerPosition, currentY, dividerPosition, pageHeight - 40);

  // Both columns start at same Y — set BEFORE left column runs
  leftColY = currentY;
  rightColY = currentY + 10;

  // -------------------------
  // LEFT COLUMN
  // -------------------------

  // --- CONTACT ---
  leftColY = drawLeftSectionHeading("CONTACT", leftColY);

  if (resume.email) {
    leftColY = checkLeftPageBreak(leftColY);
    const used = drawLeftColText(
      doc, resume.email, leftColumnRightEdge, leftMargin,
      leftColY + 10, 10, "normal", bodyTextColor, 13
    );
    leftColY += used + 4;
  }

  if (resume.phone) {
    leftColY = checkLeftPageBreak(leftColY);
    const used = drawLeftColText(
      doc, resume.phone, leftColumnRightEdge, leftMargin,
      leftColY + 10, 10, "normal", bodyTextColor, 13
    );
    leftColY += used + 4;
  }

  if (resume.address) {
    leftColY = checkLeftPageBreak(leftColY);
    const used = drawLeftColText(
      doc, resume.address, leftColumnRightEdge, leftMargin,
      leftColY + 10, 10, "normal", bodyTextColor, 13
    );
    leftColY += used + 4;
  }

  leftColY += sectionGap;

  // --- EDUCATION ---
  if (resume.education && resume.education.length > 0) {
    leftColY = checkLeftPageBreak(leftColY, 40);
    leftColY = drawLeftSectionHeading("EDUCATION", leftColY);

    resume.education.forEach((edu) => {
      if (edu.degree) {
        leftColY = checkLeftPageBreak(leftColY);
        const used = drawLeftColText(
          doc, edu.degree, leftColumnRightEdge, leftMargin,
          leftColY + 10, 10, "bold", headingColor, 13
        );
        leftColY += used + 4;
      }

      if (edu.school) {
        leftColY = checkLeftPageBreak(leftColY);
        const used = drawLeftColText(
          doc, edu.school, leftColumnRightEdge, leftMargin,
          leftColY + 10, 10, "normal", bodyTextColor, 13
        );
        leftColY += used + 4;
      }

      if (edu.graduationYear) {
        leftColY = checkLeftPageBreak(leftColY);
        const used = drawLeftColText(
          doc, edu.graduationYear, leftColumnRightEdge, leftMargin,
          leftColY + 10, 10, "normal", bodyTextColor, 13
        );
        leftColY += used + 4;
      }

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
          leftColY = checkLeftPageBreak(leftColY);
          const used = drawLeftColText(
            doc, gradeText, leftColumnRightEdge, leftMargin,
            leftColY + 10, 9, "normal", [130, 130, 130], 13
          );
          leftColY += used + 4;
        }
      }

      leftColY += 8;
    });

    leftColY += 10;
  }

  // --- SKILLS ---
  if (resume.skills && resume.skills.length > 0) {
    leftColY = checkLeftPageBreak(leftColY, 40);
    leftColY = drawLeftSectionHeading("SKILLS", leftColY);

    resume.skills.forEach((skill) => {
      leftColY = checkLeftPageBreak(leftColY);
      const used = drawLeftColText(
        doc, skill, leftColumnRightEdge, leftMargin,
        leftColY + 10, 10, "normal", bodyTextColor, 13
      );
      leftColY += used + 4;
    });

    leftColY += 15;
  }

  // --- LANGUAGES ---
  if (
    resume.additionalContent?.languages &&
    resume.additionalContent.languages.length > 0
  ) {
    leftColY = checkLeftPageBreak(leftColY, 40);
    leftColY = drawLeftSectionHeading("LANGUAGES", leftColY);

    resume.additionalContent.languages.forEach((lang) => {
      leftColY = checkLeftPageBreak(leftColY);
      const used = drawLeftColText(
        doc, lang, leftColumnRightEdge, leftMargin,
        leftColY + 10, 10, "normal", bodyTextColor, 13
      );
      leftColY += used + 4;
    });

    leftColY += 15;
  }

  // --- REFERENCES ---
  if (
    resume.additionalContent?.references &&
    resume.additionalContent.references.length > 0
  ) {
    leftColY = checkLeftPageBreak(leftColY, 40);
    leftColY = drawLeftSectionHeading("REFERENCES", leftColY);

    resume.additionalContent.references.forEach((ref) => {
      if (ref.name) {
        leftColY = checkLeftPageBreak(leftColY);
        const used = drawLeftColText(
          doc, ref.name, leftColumnRightEdge, leftMargin,
          leftColY + 10, 10, "bold", headingColor, 13
        );
        leftColY += used + 4;
      }

      if (ref.contact) {
        leftColY = checkLeftPageBreak(leftColY);
        const used = drawLeftColText(
          doc, ref.contact, leftColumnRightEdge, leftMargin,
          leftColY + 10, 10, "normal", bodyTextColor, 13
        );
        leftColY += used + 4;
      }

      leftColY += 6;
    });
  }

  // -------------------------
  // RIGHT COLUMN
  // Switch back to page 1 since left column may have added pages
  // -------------------------
  doc.setPage(1);
  rightColY = currentY + 10;

  const drawRightSectionHeading = (title) => {
    rightColY = checkRightPageBreak(rightColY, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...headingColor);
    drawSpacedText(doc, title, rightColumnStartX, rightColY, 1.5);
    rightColY += 10;
    doc.setDrawColor(...highlightColor);
    doc.setLineWidth(2);
    doc.line(rightColumnStartX, rightColY, rightColumnRightEdge, rightColY);
    rightColY += 25;
  };

  // --- SUMMARY ---
  if (resume.summary) {
    drawRightSectionHeading("SUMMARY");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...bodyTextColor);

    const summaryLines = doc.splitTextToSize(resume.summary, rightColumnWidth);
    summaryLines.forEach((line) => {
      rightColY = checkRightPageBreak(rightColY);
      doc.text(line, rightColumnStartX, rightColY);
      rightColY += 15;
    });

    rightColY += 20;
  }

  // --- EXPERIENCE ---
  if (resume.workExperience && resume.workExperience.length > 0) {
    drawRightSectionHeading("PROFESSIONAL EXPERIENCE");

    resume.workExperience.forEach((exp) => {
      rightColY = checkRightPageBreak(rightColY, 40);

      if (exp.jobTitle) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...headingColor);
        const titleLines = doc.splitTextToSize(exp.jobTitle, rightColumnWidth);
        titleLines.forEach((line) => {
          rightColY = checkRightPageBreak(rightColY);
          doc.text(line, rightColumnStartX, rightColY);
          rightColY += 15;
        });
      }

      if (exp.company || exp.startDate || exp.endDate) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...bodyTextColor);
        const companyLine = [
          exp.company,
          `${exp.startDate || ""} - ${exp.endDate || ""}`,
        ]
          .filter(Boolean)
          .join(" / ");
        const wrappedCompany = doc.splitTextToSize(
          companyLine,
          rightColumnWidth
        );
        wrappedCompany.forEach((line) => {
          rightColY = checkRightPageBreak(rightColY);
          doc.text(line, rightColumnStartX, rightColY);
          rightColY += 15;
        });
        rightColY += 3;
      }

      if (exp.responsibilities) {
        const bullets =
          typeof exp.responsibilities === "string"
            ? exp.responsibilities.split("\n").filter((p) => p.trim())
            : Array.isArray(exp.responsibilities)
            ? exp.responsibilities.flatMap((p) =>
                p.split("\n").filter((l) => l.trim())
              )
            : [];

        bullets.forEach((point) => {
          if (!point.trim()) return;
          const wrappedLines = doc.splitTextToSize(
            point.trim(),
            rightColumnWidth - 10
          );
          wrappedLines.forEach((line, i) => {
            rightColY = checkRightPageBreak(rightColY);
            doc.setFontSize(10);
            doc.setTextColor(...bodyTextColor);
            if (i === 0) {
              doc.text("-", rightColumnStartX, rightColY);
              doc.text(line, rightColumnStartX + 10, rightColY);
            } else {
              doc.text(line, rightColumnStartX + 10, rightColY);
            }
            rightColY += 14;
          });
          rightColY += 4;
        });
      }

      rightColY += 5;
    });
  }

  // --- DISTINCTIONS ---
  if (resume.distinctions && resume.distinctions.length > 0) {
    drawRightSectionHeading("DISTINCTIONS");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...bodyTextColor);

    resume.distinctions.forEach((dist) => {
      if (!dist.title) return;
      const line = dist.year
        ? `${dist.title} (${dist.year})`
        : dist.title;
      const wrappedLines = doc.splitTextToSize(line, rightColumnWidth - 10);
      wrappedLines.forEach((l, i) => {
        rightColY = checkRightPageBreak(rightColY);
        if (i === 0) {
          doc.text("-", rightColumnStartX, rightColY);
          doc.text(l, rightColumnStartX + 10, rightColY);
        } else {
          doc.text(l, rightColumnStartX + 10, rightColY);
        }
        rightColY += 14;
      });
      rightColY += 4;
    });
  }

  return doc;
}