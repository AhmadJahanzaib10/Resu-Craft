// ResumeTemplates/Template6.js

import { jsPDF } from "jspdf";

export function generateTemplate6PDF(resume) {
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Define columns
  const leftColumnWidth = pageWidth / 2 - 80; // Further reduced width to prevent overlap
  const rightColumnWidth = pageWidth / 2 - 40;
  
  // Margins & positions
  const leftMargin = 40; // Moved left margin more to the left
  let leftY = 80;  // starting Y position for left column
  let rightY = 80; // starting Y position for right column
  const lineHeight = 18;
  const sectionGap = 25; // Reduced section gap
  
  // Colors & Fonts
  const textColor = [60, 60, 60];     // dark gray for text
  const headingColor = [60, 60, 60];  // dark gray for headings

  // Draw a vertical line between left and right columns
  doc.setDrawColor(200, 200, 200); // Light gray color
  doc.setLineWidth(1);
  // Moved the vertical divider line slightly left to create more space for right column
  const dividerPosition = pageWidth / 2 - 10;
  doc.line(dividerPosition, 40, dividerPosition, pageHeight - 40);
  
  // Adjusted right column start to match the new divider position
  const rightColumnStart = pageWidth / 2 + 10;

  // -------------------------
  // HEADER SECTION: Name and title on the right side
  // -------------------------
  
  // Starting Y position for right header
  let headerRightY = 80;
  
  // Name on right side (split into first and last name if possible)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28); // Reduced name size
  doc.setTextColor(...textColor);
  
  // Set the name to MUNEEB AHMAD
  let firstName = "Unknown";
  let lastName = "Unknown";
  
  if (resume.name) {
    const nameParts = resume.name.split(' ');
    if (nameParts.length >= 2) {
      firstName = nameParts[0].toUpperCase();
      lastName = nameParts.slice(1).join(' ').toUpperCase();
    } else {
      // If only one word name
      firstName = resume.name.toUpperCase();
      lastName = "";
    }
  }
  
  // Position name on right side with proper alignment
  
  doc.text(firstName, rightColumnStart, headerRightY);
  headerRightY += 40;
  if (lastName) {
    doc.text(lastName, rightColumnStart, headerRightY);
    headerRightY += 40;
  }

  // Job Title on right side
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...textColor);
  
  // Set the job title to SOFTWARE ENGINEER
  let jobTitle = "SOFTWARE ENGINEER";
  if (resume.workExperience && resume.workExperience.length > 0 && resume.workExperience[0].jobTitle) {
    jobTitle = resume.workExperience[0].jobTitle.toUpperCase();
  }
  
  
  doc.text(jobTitle, rightColumnStart, headerRightY);
  headerRightY += 60; // Added more space after title

  // Contact Information with proper icons
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  
  // Use a standard font with icon characters
  const standardIcons = {
    phone: "☏", // Phone symbol
    email: "✉", // Envelope symbol
    house: "⌂", // House symbol
    web: "⊕"    // Circled plus symbol
  };
  
  // Phone with proper phone icon
  if (resume.phone) {
    doc.setFont("symbol", "normal");
    doc.text(standardIcons.phone, rightColumnStart - 15, headerRightY);
    doc.setFont("helvetica", "normal");
    doc.text(resume.phone, rightColumnStart, headerRightY);
    headerRightY += 30;
  } else {
    // Default phone
    doc.setFont("symbol", "normal");
    doc.text(standardIcons.phone, rightColumnStart - 15, headerRightY);
    doc.setFont("helvetica", "normal");
    doc.text("+123-456-7890", rightColumnStart, headerRightY);
    headerRightY += 30;
  }
  
  // Email with proper email icon
  if (resume.email) {
    doc.setFont("symbol", "normal");
    doc.text(standardIcons.email, rightColumnStart - 15, headerRightY);
    doc.setFont("helvetica", "normal");
    doc.text(resume.email, rightColumnStart, headerRightY);
    headerRightY += 30;
  } else {
    // Default email
    doc.setFont("symbol", "normal");
    doc.text(standardIcons.email, rightColumnStart - 15, headerRightY);
    doc.setFont("helvetica", "normal");
    doc.text("email@example.com", rightColumnStart, headerRightY);
    headerRightY += 30;
  }
  
  // Address with proper house icon
  if (resume.address) {
    doc.setFont("symbol", "normal");
    doc.text(standardIcons.house, rightColumnStart - 15, headerRightY);
    doc.setFont("helvetica", "normal");
    
    const addressLines = doc.splitTextToSize(resume.address, rightColumnWidth);
    addressLines.forEach((line, i) => {
      doc.text(line, rightColumnStart, headerRightY + (i * lineHeight));
    });
    headerRightY += (addressLines.length * lineHeight) + 10;
  } else {
    // Default address
    doc.setFont("symbol", "normal");
    doc.text(standardIcons.house, rightColumnStart - 15, headerRightY);
    doc.setFont("helvetica", "normal");
    doc.text("City, State Abbreviation zip code", rightColumnStart, headerRightY);
    headerRightY += 30;
  }
  
  // LinkedIn with web icon
  doc.setFont("symbol", "normal");
  doc.text(standardIcons.web, rightColumnStart - 15, headerRightY);
  doc.setFont("helvetica", "normal");
  
  if (resume.linkedIn) {
    doc.setTextColor(0, 0, 255); // Blue for links
    doc.textWithLink("LinkedIn", rightColumnStart, headerRightY, { url: resume.linkedIn });
    doc.setTextColor(...textColor);
    if (resume.portfolio) {
      doc.text(" | Portfolio", rightColumnStart + 50, headerRightY);
    }
  } else {
    // Default
    doc.text("LinkedIn | Portfolio", rightColumnStart, headerRightY);
  }
  headerRightY += 40;
  
  // Set rightY to headerRightY for the rest of the right column content
  rightY = headerRightY;

  // -------------------------
  // LEFT COLUMN: Now starts with Education, Work Experience (name moved to right)
  // -------------------------
  
  // Start left column from top
  leftY = 80;

  // Education section heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Reduced section title from 18 to 16
  doc.setTextColor(...headingColor);
  doc.text("EDUCATION", leftMargin, leftY);
  leftY += sectionGap;

  // Add education details if available
  if (resume.education && resume.education.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    resume.education.forEach((edu) => {
      if (edu.degree) {
        doc.setFont("helvetica", "bold");
        doc.text(edu.degree, leftMargin, leftY);
        leftY += lineHeight;
      }
      
      if (edu.school) {
        doc.setFont("helvetica", "normal");
        doc.text(edu.school, leftMargin, leftY);
        leftY += lineHeight;
      }
      
      if (edu.graduationYear) {
        doc.text(edu.graduationYear, leftMargin, leftY);
        leftY += lineHeight;
      }
      
      leftY += 15; // Space between education entries
    });
  } else {
    // Default education if none provided
    doc.setFont("helvetica", "bold");
    doc.text("Bachelor of Science (B.S.) Business Administration", leftMargin, leftY);
    leftY += lineHeight;
    
    doc.setFont("helvetica", "normal");
    doc.text("Temple University, Philadelphia, PA", leftMargin, leftY);
    leftY += lineHeight;
    
    doc.text("September 2011 – June 2015", leftMargin, leftY);
    leftY += lineHeight + 15;
  }
  
  leftY += 10; // Add some space before next section

  // Work Experience section heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Reduced section title from 18 to 16
  doc.setTextColor(...headingColor);
  doc.text("WORK EXPERIENCE", leftMargin, leftY);
  leftY += sectionGap;
  
  // Add work experience details if available
  if (resume.workExperience && resume.workExperience.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    resume.workExperience.forEach((exp) => {
      if (exp.jobTitle) {
        doc.setFont("helvetica", "bold");
        doc.text(exp.jobTitle, leftMargin, leftY);
        leftY += lineHeight;
      }
      
      if (exp.company) {
        doc.setFont("helvetica", "normal");
        doc.text(exp.company, leftMargin, leftY);
        leftY += lineHeight;
      }
      
      if (exp.startDate || exp.endDate) {
        const dateRange = `${exp.startDate || ""} - ${exp.endDate || ""}`;
        doc.text(dateRange, leftMargin, leftY);
        leftY += lineHeight + 5; // Added extra spacing after date before bullet points
      }
      
      // Use bullet points for responsibilities if available
      if (exp.responsibilities) {
        // Split responsibilities into individual points if they're in a single string
        let respPoints = [];
        if (typeof exp.responsibilities === 'string') {
          // Try to split by common delimiters
          respPoints = exp.responsibilities.split(/[•\-\.\;\,]\s+/).filter(point => point.trim().length > 0);
          if (respPoints.length <= 1) {
            // If no good split found, split by sentences
            respPoints = exp.responsibilities.split(/\.\s+/).filter(point => point.trim().length > 0);
          }
        } else if (Array.isArray(exp.responsibilities)) {
          respPoints = exp.responsibilities;
        }
        
        // Add each responsibility as a bullet point
        respPoints.forEach(point => {
          if (point.trim()) {
            // Use slightly smaller font for work experience bullet points to fit better
            doc.setFontSize(10);
            const wrappedLines = doc.splitTextToSize(point.trim(), leftColumnWidth - 5);
            
              // Draw every line with a bullet
            wrappedLines.forEach(line => {
              doc.text(`• ${line}`, leftMargin, leftY);
              leftY += lineHeight - 3;
            });
            // Reset font size back to normal
            doc.setFontSize(11);
          }
        });
      }
      
      leftY += 15; // Space between experiences
    });
  } else {
    // Default work experience if none provided
    // First job
    doc.setFont("helvetica", "bold");
    doc.text("Business Analyst", leftMargin, leftY);
    leftY += lineHeight;
    
    doc.setFont("helvetica", "normal");
    doc.text("GrowthPartners, Philadelphia, PA", leftMargin, leftY);
    leftY += lineHeight;
    
    doc.text("Oct 2019 – present", leftMargin, leftY);
    leftY += lineHeight + 5; // Added extra spacing after date before bullet points
    
    // Bullet points for first job (shortened slightly to prevent overflow)
    const job1Points = [
      "Collaborated with senior managers to optimize operational processes, resulting in a 23% revenue increase in 2021",
      "Launched a client services incentive program that improved customer satisfaction by 32% during an 18-month period",
      "Performed market research to identify opportunities for growth in underserved niches",
      "Analyzed performance metrics to deliver reports that drive strategic decision-making"
    ];
    
    job1Points.forEach(point => {
      const bulletPoint = `• ${point}`;
      // Use slightly smaller font for bullet points to fit better
      doc.setFontSize(10);
      const wrappedLines = doc.splitTextToSize(bulletPoint, leftColumnWidth - 5);
      
      doc.text(wrappedLines[0], leftMargin, leftY);
      leftY += lineHeight - 3;
      
      for (let i = 1; i < wrappedLines.length; i++) {
        doc.text(wrappedLines[i], leftMargin + 10, leftY);
        leftY += lineHeight - 3;
      }
      // Reset font size
      doc.setFontSize(11);
    });
    
    leftY += 15;
    
    // Second job
    doc.setFont("helvetica", "bold");
    doc.text("Department Manager", leftMargin, leftY);
    leftY += lineHeight;
    
    doc.setFont("helvetica", "normal");
    doc.text("BeScene Corp., Philadelphia, PA", leftMargin, leftY);
    leftY += lineHeight;
    
    doc.text("June 2015 – Oct 2019", leftMargin, leftY);
    leftY += lineHeight + 5; // Added extra spacing after date
    
    // Bullet points for second job
    const job2Points = [
      "Onboarded and trained new associates",
      "Managed a team of 25 employees, serving as a mentor",
      "Created a new employee handbook that improved team member retention during the first 90 days by 12%",
      "Conducted a supplier study to identify vendor savings opportunities",
      "Launched an employee incentive program that reduced call-offs by 34%"
    ];
    
    job2Points.forEach(point => {
      const bulletPoint = `• ${point}`;
      // Use slightly smaller font for bullet points to fit better
      doc.setFontSize(10);
      const wrappedLines = doc.splitTextToSize(bulletPoint, leftColumnWidth - 5);
      
      doc.text(wrappedLines[0], leftMargin, leftY);
      leftY += lineHeight - 3;
      
      for (let i = 1; i < wrappedLines.length; i++) {
        doc.text(wrappedLines[i], leftMargin + 10, leftY);
        leftY += lineHeight - 3;
      }
      // Reset font size
      doc.setFontSize(11);
    });
  }

  // -------------------------
  // RIGHT COLUMN: Profile, Skills, Certifications (name and contact info already added above)
  // -------------------------
  
  // Profile Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Reduced section title from 20 to 16
  doc.setTextColor(...headingColor);
  doc.text("PROFILE", rightColumnStart, rightY);
  rightY += 25;
  
  // Profile/Summary text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  
  if (resume.summary) {
    const profileLines = doc.splitTextToSize(resume.summary, rightColumnWidth);
    profileLines.forEach((line) => {
      doc.text(line, rightColumnStart, rightY);
      rightY += lineHeight;
    });
  } else {
    // Default profile
    const defaultProfile = "Experienced business leader with seven years of experience boosting operational efficiency in the manufacturing sector, resulting in increased profitability by 24% in one fiscal year. Confident leader, respected mentor, and strategic planner with a track record of identifying revenue-producing business opportunities.";
    const profileLines = doc.splitTextToSize(defaultProfile, rightColumnWidth);
    profileLines.forEach((line) => {
      doc.text(line, rightColumnStart, rightY);
      rightY += lineHeight;
    });
  }
  rightY += 25;
  
  // Skills Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Reduced section title from 20 to 16
  doc.setTextColor(...headingColor);
  doc.text("SKILLS", rightColumnStart, rightY);
  rightY += 25;
  
  // Skills with bullet points
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  
  if (resume.skills && resume.skills.length > 0) {
    resume.skills.forEach((skill) => {
      // Bullet point
      doc.text("•", rightColumnStart, rightY);
      // Skill text with indentation
      doc.text(skill, rightColumnStart + 15, rightY);
      rightY += lineHeight + 2;
    });
  } else {
    // Default skills
    const defaultSkills = [
      "Complex problem-solving",
      "Cross-functional collaboration",
      "Organizational change",
      "Performance management",
      "Strategic business planning",
      "Team leadership and motivation"
    ];
    
    defaultSkills.forEach((skill) => {
      doc.text("•", rightColumnStart, rightY);
      doc.text(skill, rightColumnStart + 15, rightY);
      rightY += lineHeight + 2;
    });
  }
  rightY += 15;
  
  // Remove certifications section entirely
  
  // Save the PDF
  return doc;
}