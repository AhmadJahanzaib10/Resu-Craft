import { jsPDF } from "jspdf";

export function generateTemplate6PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const leftColumnWidth = pageWidth / 2 - 80;
  const rightColumnWidth = pageWidth / 2 - 40;

  const leftMargin = 40;
  let leftY = 80;
  let rightY = 80;
  const lineHeight = 18;
  const sectionGap = 25;

  const textColor = [60, 60, 60];
  const headingColor = [60, 60, 60];

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  const dividerPosition = pageWidth / 2 - 10;
  doc.line(dividerPosition, 40, dividerPosition, pageHeight - 40);

  const rightColumnStart = pageWidth / 2 + 10;

  const checkLeftPageBreak = (y) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.line(dividerPosition, 40, dividerPosition, pageHeight - 40);
      return 60;
    }
    return y;
  };

  const checkRightPageBreak = (y) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.line(dividerPosition, 40, dividerPosition, pageHeight - 40);
      return 60;
    }
    return y;
  };

  // -------------------------
  // HEADER
  // -------------------------
  let headerRightY = 80;

  if (resume.name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...textColor);

    const nameParts = resume.name.split(" ");
    const firstName = nameParts[0].toUpperCase();
    const lastName = nameParts.slice(1).join(" ").toUpperCase();

    doc.text(firstName, rightColumnStart, headerRightY);
    headerRightY += 40;
    if (lastName) {
      doc.text(lastName, rightColumnStart, headerRightY);
      headerRightY += 40;
    }
  }

  if (resume.workExperience && resume.workExperience.length > 0 && resume.workExperience[0].jobTitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text(resume.workExperience[0].jobTitle.toUpperCase(), rightColumnStart, headerRightY);
    headerRightY += 60;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);

  if (resume.phone) {
    doc.text("Tel: " + resume.phone, rightColumnStart, headerRightY);
    headerRightY += 30;
  }

  if (resume.email) {
    const emailLines = doc.splitTextToSize("Email: " + resume.email, rightColumnWidth);
    emailLines.forEach((line) => {
      doc.text(line, rightColumnStart, headerRightY);
      headerRightY += lineHeight;
    });
    headerRightY += 5;
  }

  if (resume.address) {
    const addressLines = doc.splitTextToSize("Address: " + resume.address, rightColumnWidth);
    addressLines.forEach((line) => {
      doc.text(line, rightColumnStart, headerRightY);
      headerRightY += lineHeight;
    });
    headerRightY += 10;
  }

  rightY = headerRightY;

  // -------------------------
  // LEFT COLUMN
  // -------------------------
  leftY = 80;

  // --- EDUCATION ---
  if (resume.education && resume.education.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    doc.text("EDUCATION", leftMargin, leftY);
    leftY += sectionGap;

    doc.setFontSize(11);

    resume.education.forEach((edu) => {
      if (edu.degree) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        const degreeLines = doc.splitTextToSize(edu.degree, leftColumnWidth);
        degreeLines.forEach((line) => {
          leftY = checkLeftPageBreak(leftY);
          doc.text(line, leftMargin, leftY);
          leftY += lineHeight;
        });
      }

      if (edu.school) {
        doc.setFont("helvetica", "normal");
        const schoolLines = doc.splitTextToSize(edu.school, leftColumnWidth);
        schoolLines.forEach((line) => {
          leftY = checkLeftPageBreak(leftY);
          doc.text(line, leftMargin, leftY);
          leftY += lineHeight;
        });
      }

      if (edu.graduationYear) {
        doc.setFont("helvetica", "normal");
        leftY = checkLeftPageBreak(leftY);
        doc.text(edu.graduationYear, leftMargin, leftY);
        leftY += lineHeight;
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
          doc.setFontSize(10);
          doc.setTextColor(130, 130, 130);
          leftY = checkLeftPageBreak(leftY);
          doc.text(gradeText, leftMargin, leftY);
          doc.setFontSize(11);
          doc.setTextColor(...textColor);
          leftY += lineHeight;
        }
      }

      leftY += 15;
      leftY = checkLeftPageBreak(leftY);
    });

    leftY += 10;
  }

  // --- WORK EXPERIENCE ---
  if (resume.workExperience && resume.workExperience.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    leftY = checkLeftPageBreak(leftY);
    doc.text("WORK EXPERIENCE", leftMargin, leftY);
    leftY += sectionGap;

    doc.setFontSize(11);

    resume.workExperience.forEach((exp) => {
      if (exp.jobTitle) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        leftY = checkLeftPageBreak(leftY);
        doc.text(exp.jobTitle, leftMargin, leftY);
        leftY += lineHeight;
      }

      if (exp.company) {
        doc.setFont("helvetica", "normal");
        leftY = checkLeftPageBreak(leftY);
        doc.text(exp.company, leftMargin, leftY);
        leftY += lineHeight;
      }

      if (exp.startDate || exp.endDate) {
        const dateRange = `${exp.startDate || ""} - ${exp.endDate || ""}`;
        leftY = checkLeftPageBreak(leftY);
        doc.text(dateRange, leftMargin, leftY);
        leftY += lineHeight + 5;
      }

      if (exp.responsibilities) {
        let respPoints = [];
        if (typeof exp.responsibilities === "string") {
          respPoints = exp.responsibilities
            .split(/\r?\n/)
            .filter((p) => p.trim().length > 0);
          if (respPoints.length <= 1) {
            respPoints = exp.responsibilities
              .split(/\.\s+/)
              .filter((p) => p.trim().length > 0);
          }
        } else if (Array.isArray(exp.responsibilities)) {
          respPoints = exp.responsibilities;
        }

        respPoints.forEach((point) => {
          if (point.trim()) {
            doc.setFontSize(10);
            const wrappedLines = doc.splitTextToSize(point.trim(), leftColumnWidth - 5);
            wrappedLines.forEach((line, idx) => {
              leftY = checkLeftPageBreak(leftY);
              doc.text(idx === 0 ? `- ${line}` : `  ${line}`, leftMargin, leftY);
              leftY += lineHeight - 3;
            });
            doc.setFontSize(11);
          }
        });
      }

      leftY += 15;
      leftY = checkLeftPageBreak(leftY);
    });
  }

  // --- LANGUAGES (left column) ---
  if (
    resume.additionalContent?.languages &&
    resume.additionalContent.languages.length > 0
  ) {
    leftY = checkLeftPageBreak(leftY, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    doc.text("LANGUAGES", leftMargin, leftY);
    leftY += sectionGap;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    resume.additionalContent.languages.forEach((lang) => {
      leftY = checkLeftPageBreak(leftY);
      doc.text(`- ${lang}`, leftMargin, leftY);
      leftY += lineHeight;
    });

    leftY += 15;
  }

  // --- REFERENCES (left column) ---
  if (
    resume.additionalContent?.references &&
    resume.additionalContent.references.length > 0
  ) {
    leftY = checkLeftPageBreak(leftY, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    doc.text("REFERENCES", leftMargin, leftY);
    leftY += sectionGap;

    doc.setFontSize(11);

    resume.additionalContent.references.forEach((ref) => {
      if (ref.name) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        leftY = checkLeftPageBreak(leftY);
        doc.text(ref.name, leftMargin, leftY);
        leftY += lineHeight;
      }

      if (ref.contact) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        const contactLines = doc.splitTextToSize(ref.contact, leftColumnWidth);
        contactLines.forEach((line) => {
          leftY = checkLeftPageBreak(leftY);
          doc.text(line, leftMargin, leftY);
          leftY += lineHeight;
        });
      }

      leftY += 10;
      leftY = checkLeftPageBreak(leftY);
    });
  }

  // -------------------------
  // RIGHT COLUMN
  // Switch to page 1 before drawing right column
  // -------------------------
  doc.setPage(1);
  rightY = headerRightY;

  // --- PROFILE ---
  if (resume.summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    rightY = checkRightPageBreak(rightY);
    doc.text("PROFILE", rightColumnStart, rightY);
    rightY += 25;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    const profileLines = doc.splitTextToSize(resume.summary, rightColumnWidth);
    profileLines.forEach((line) => {
      rightY = checkRightPageBreak(rightY);
      doc.text(line, rightColumnStart, rightY);
      rightY += lineHeight;
    });
    rightY += 25;
  }

  // --- SKILLS ---
  if (resume.skills && resume.skills.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    rightY = checkRightPageBreak(rightY);
    doc.text("SKILLS", rightColumnStart, rightY);
    rightY += 25;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    resume.skills.forEach((skill) => {
      rightY = checkRightPageBreak(rightY);
      doc.text(`- ${skill}`, rightColumnStart, rightY);
      rightY += lineHeight + 2;
    });
    rightY += 15;
  }

  // --- DISTINCTIONS ---
  if (resume.distinctions && resume.distinctions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...headingColor);
    rightY = checkRightPageBreak(rightY);
    doc.text("DISTINCTIONS", rightColumnStart, rightY);
    rightY += 25;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    resume.distinctions.forEach((dist) => {
      if (!dist.title) return;
      const line = dist.year ? `- ${dist.title} (${dist.year})` : `- ${dist.title}`;
      const distLines = doc.splitTextToSize(line, rightColumnWidth);
      distLines.forEach((l) => {
        rightY = checkRightPageBreak(rightY);
        doc.text(l, rightColumnStart, rightY);
        rightY += lineHeight;
      });
    });
  }

  return doc;
}