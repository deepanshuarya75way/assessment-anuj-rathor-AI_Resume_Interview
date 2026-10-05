const PDFDocument =
require("pdfkit");

const template =
require("../templates/modern.template");

// =============================
// SMART SPACING ENGINE
// =============================

function smartMoveDown(
  doc,
  value = 0.25
) {

  if (doc.y < 650) {
    doc.moveDown(value);
  } else {
    doc.moveDown(0.1);
  }
}

// =============================
// SECTION TITLE
// =============================

function addSectionTitle(
  doc,
  title
) {

  smartMoveDown(doc, 0.35);

  const y = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#111827")
    .text(
      title.toUpperCase(),
      32,
      y
    );

  doc
    .moveTo(32, y + 16)
    .lineTo(563, y + 16)
    .lineWidth(0.8)
    .strokeColor("#D1D5DB")
    .stroke();

  smartMoveDown(doc, 0.45);
}

// =============================
// PAGE SPACE CHECK
// =============================

function ensureSpace(
  doc,
  required = 80
) {

  if (
    doc.y + required >
    doc.page.height - 45
  ) {
    doc.addPage();
  }
}

// =============================
// BULLET RENDER
// =============================

function renderBulletList(
  doc,
  points = []
) {

  points.forEach((point) => {

    ensureSpace(doc, 22);

    doc
      .font("Helvetica")
      .fontSize(9.8)
      .fillColor("#1F2937")
      .text(
        `• ${point}`,
        42,
        doc.y,
        {
          width: 510,
          lineGap: 1.5,
          align: "left"
        }
      );

    smartMoveDown(doc, 0.16);
  });
}

// =============================
// EXPERIENCE
// =============================

function renderExperience(
  doc,
  experience = []
) {

  if (!experience.length)
    return;

  addSectionTitle(
    doc,
    "Experience"
  );

  experience.forEach((job) => {

    ensureSpace(doc, 95);

    const currentY = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(10.8)
      .fillColor("#111827")
      .text(
        job.title,
        32,
        currentY,
        {
          continued: true
        }
      );

    doc
      .font("Helvetica")
      .fillColor("#2563EB")
      .text(
        `  @ ${job.company}`
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#6B7280")
      .text(
        `${job.startDate} – ${job.endDate || "Present"}`,
        420,
        currentY,
        {
          width: 120,
          align: "right"
        }
      );

    if (job.location) {

      doc
        .font("Helvetica")
        .fontSize(8.8)
        .fillColor("#6B7280")
        .text(
          job.location,
          32
        );
    }

    smartMoveDown(doc, 0.18);

    renderBulletList(
      doc,
      job.points
    );

    smartMoveDown(doc, 0.35);
  });
}

// =============================
// PROJECTS
// =============================

function renderProjects(
  doc,
  projects = []
) {

  if (!projects.length)
    return;

  addSectionTitle(
    doc,
    "Projects"
  );

  projects.forEach((project) => {

    ensureSpace(doc, 85);

    doc
      .font("Helvetica-Bold")
      .fontSize(10.6)
      .fillColor("#111827")
      .text(
        project.name,
        {
          continued: true
        }
      );

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#2563EB")
      .text(
        `   (${project.stack || ""})`
      );

    smartMoveDown(doc, 0.08);

    // LINKS

    if (
      project.liveUrl ||
      project.githubUrl
    ) {

      if (project.liveUrl) {

        doc
          .font("Helvetica")
          .fontSize(8.8)
          .fillColor("#2563EB")
          .text(
            "Live Project",
            {
              link: project.liveUrl,
              underline: false,
              continued: true
            }
          );
      }

      if (
        project.liveUrl &&
        project.githubUrl
      ) {

        doc.text(
          "  |  ",
          {
            continued: true
          }
        );
      }

      if (project.githubUrl) {

        doc.text(
          "GitHub",
          {
            link: project.githubUrl,
            underline: false
          }
        );
      }
    }

    smartMoveDown(doc, 0.15);

    renderBulletList(
      doc,
      project.points
    );

    smartMoveDown(doc, 0.35);
  });
}

// =============================
// SKILLS
// =============================

function renderSkills(
  doc,
  skills = []
) {

  if (!skills.length)
    return;

  addSectionTitle(
    doc,
    "Skills"
  );

  const skillText =
    skills.join(" • ");

  doc
    .font("Helvetica")
    .fontSize(9.8)
    .fillColor("#374151")
    .text(
      skillText,
      {
        columns: 2,
        columnGap: 18,
        align: "left"
      }
    );

  smartMoveDown(doc, 0.35);
}

// =============================
// EDUCATION
// =============================

function renderEducation(
  doc,
  education = []
) {

  if (!education.length)
    return;

  addSectionTitle(
    doc,
    "Education"
  );

  education.forEach((edu) => {

    ensureSpace(doc, 50);

    const currentY = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(10.8)
      .fillColor("#111827")
      .text(
        edu.degree,
        32,
        currentY
      );

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#374151")
      .text(
        edu.school,
        32
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#6B7280")
      .text(
        `${edu.startDate} - ${edu.endDate}`,
        420,
        currentY,
        {
          width: 120,
          align: "right"
        }
      );

    if (edu.score) {

      doc
        .font("Helvetica")
        .fontSize(8.8)
        .fillColor("#2563EB")
        .text(
          `Score: ${edu.score}`
        );
    }

    smartMoveDown(doc, 0.35);
  });
}

// =============================
// MAIN PDF GENERATOR
// =============================

async function generateResumePDF(
  resume
) {

  return new Promise(
    (resolve, reject) => {

      try {

        const doc =
          new PDFDocument({

            size: "A4",

            margins: {
              top: 28,
              bottom: 24,
              left: 32,
              right: 32
            },

            bufferPages: true
          });

        const buffers = [];

        doc.on(
          "data",
          buffers.push.bind(buffers)
        );

        doc.on("end", () => {

          const pdfData =
            Buffer.concat(buffers);

          resolve(pdfData);
        });

        // =============================
        // HEADER
        // =============================

        // NAME

        doc
          .font("Helvetica-Bold")
          .fontSize(26)
          .fillColor("#111827")
          .text(
            resume.name || "",
            32,
            30,
            {
              width: 320
            }
          );

        // ROLE

        doc
          .moveDown(0.1)
          .font("Helvetica")
          .fontSize(12)
          .fillColor("#2563EB")
          .text(
            resume.role || ""
          );

        // CONTACT RIGHT COLUMN

        const rightX = 380;

        const contacts = [
          resume.phone,
          resume.email,
          resume.linkedin,
          resume.github
        ].filter(Boolean);

        doc
          .font("Helvetica")
          .fontSize(9.3)
          .fillColor("#374151");

        contacts.forEach(
          (item, index) => {

            doc.text(
              item,
              rightX,
              35 + (12 * index),
              {
                width: 170,
                align: "right"
              }
            );
          }
        );

        // PREMIUM HEADER LINE

        doc
          .moveDown(0.25)
          .moveTo(32, 92)
          .lineTo(563, 92)
          .lineWidth(1.5)
          .strokeColor("#2563EB")
          .stroke();

        doc.y = 105;

        // =============================
        // SUMMARY
        // =============================

        if (resume.summary) {

          addSectionTitle(
            doc,
            "Professional Summary"
          );

          doc
            .font("Helvetica")
            .fontSize(9.9)
            .fillColor("#374151")
            .text(
              resume.summary,
              {
                width: 520,
                lineGap: 2,
                align: "justify"
              }
            );

          smartMoveDown(doc, 0.35);
        }

        // =============================
        // MAIN CONTENT
        // =============================

        renderExperience(
          doc,
          resume.experience
        );

        renderProjects(
          doc,
          resume.projects
        );

        renderSkills(
          doc,
          resume.skills
        );

        renderEducation(
          doc,
          resume.education
        );

        // =============================
        // FOOTER
        // =============================

        const pages =
          doc.bufferedPageRange();

        for (
          let i = 0;
          i < pages.count;
          i++
        ) {

          doc.switchToPage(i);

          doc
            .font("Helvetica")
            .fontSize(7.5)
            .fillColor("#9CA3AF")
            .text(
              `Page ${i + 1} of ${pages.count}`,
              0,
              doc.page.height - 18,
              {
                align: "center"
              }
            );
        }

        doc.end();

      } catch (err) {

        reject(err);
      }
    }
  );
}

module.exports = {
  generateResumePDF
};