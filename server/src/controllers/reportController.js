import PDFDocument from "pdfkit";
import fs from "fs";

const generatePreliminaryReport = async (req, res) => {
  try {

    const getFontPaths = () => {
      const regularFont =
        process.platform === "win32"
          ? "C:\\Windows\\Fonts\\arial.ttf"
          : "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

      const boldFont =
        process.platform === "win32"
          ? "C:\\Windows\\Fonts\\arialbd.ttf"
          : "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

      return {
        regularFont,
        boldFont,
      };
    };

    const { analysisResult } = req.body || {};

    // console.log(
    //   JSON.stringify(
    //     analysisResult.finalEvaluation,
    //     null,
    //     2
    //   )
    // );

    if (!analysisResult) {
      return res.status(400).json({
        success: false,
        message: "Rapor oluşturmak için analiz sonucu gereklidir.",
      });
    }

    const projectName =
      analysisResult.summary?.projectName || "Teknik Destek Başvurusu";

    const createSafeFileName = (value = "Teknik Destek Basvurusu") => {
      return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .replace(/İ/g, "I")
        .replace(/ş/g, "s")
        .replace(/Ş/g, "S")
        .replace(/ğ/g, "g")
        .replace(/Ğ/g, "G")
        .replace(/ü/g, "u")
        .replace(/Ü/g, "U")
        .replace(/ö/g, "o")
        .replace(/Ö/g, "O")
        .replace(/ç/g, "c")
        .replace(/Ç/g, "C")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    };

    const safeFileName =
      createSafeFileName(projectName) || "Teknik-Destek";

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const { regularFont, boldFont } = getFontPaths();

    if (!fs.existsSync(regularFont) || !fs.existsSync(boldFont)) {
      throw new Error(
        "PDF için gerekli Unicode font dosyaları bulunamadı."
      );
    }

    doc.registerFont("Regular", regularFont);
    doc.registerFont("Bold", boldFont);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}-On-Rapor.pdf"`
    );

    doc.pipe(res);

    addTitle(doc, "AI Destekli Teknik Destek Ön Analiz Raporu");

    addInfoSection(doc, analysisResult.summary);
    addPrioritySection(doc, analysisResult.priorityAlignment);

    addFindingsSection(
      doc,
      "Başvuru - Teknik Şartname Tutarlılığı",
      analysisResult.consistencyFindings
    );

    addFindingsSection(
      doc,
      "Fiyat Teklifi Analizi",
      analysisResult.priceOfferAnalysis
    );

    addFindingsSection(
      doc,
      "Performans Göstergeleri",
      analysisResult.performanceIndicators
    );

    addFindingsSection(
      doc,
      "İhtiyaç Analizi",
      analysisResult.needAnalysis
    );

    addFindingsSection(
      doc,
      "Hedef Grup Analizi",
      analysisResult.targetGroupAnalysis
    );

    addFindingsSection(
      doc,
      "Sürdürülebilirlik Analizi",
      analysisResult.sustainabilityAnalysis
    );

    addFindingsSection(
      doc,
      "Teknik Şartname Analizi",
      analysisResult.technicalSpecificationAnalysis
    );

    addFindingsSection(
      doc,
      "Mükerrerlik Riski",
      analysisResult.duplicationRisk
    );

    addFindingsSection(
      doc,
      "Dil ve Anlatım Analizi",
      analysisResult.languageClarityAnalysis
    );

    addFindingsSection(
      doc,
      "Zayıf Yönler",
      analysisResult.weakPoints
    );

    addFindingsSection(
      doc,
      "Güçlendirme Önerileri",
      analysisResult.recommendations
    );

    addFindingsSection(
      doc,
      "Uzman Kontrolü Gereken Hususlar",
      analysisResult.expertReviewItems
    );
    addTextSection(
      doc,
      "Genel Ön Rapor",
      analysisResult.preliminaryReport
    );

    addFinalEvaluationSection(
      doc,
      analysisResult.finalEvaluation
    );

    addDisclaimer(doc);

    doc.end();
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    console.error("PDF hata mesajı:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Ön rapor PDF oluşturulurken hata oluştu.",
      });
    }

    res.end();
  }
};

const addTitle = (doc, title) => {
  doc
    .fontSize(20)
    .font("Bold")
    .text(title, {
      align: "center",
    });

  doc.moveDown(1.5);
};

const addInfoSection = (doc, summary = {}) => {
  addSectionTitle(doc, "Analiz Özeti");

  const rows = [
    ["Başvuru Sahibi", summary.applicantName],
    ["Proje Adı", summary.projectName],
    ["Destek Türü", summary.supportType],
    ["Süre", summary.duration],
    ["Uygulama Alanı", summary.location],
    ["Seçilen Öncelik", summary.priority],
    ["Öncelik Durumu", summary.priorityStatus],
    ["Analiz Durumu", summary.analysisStatus],
  ];

  rows.forEach(([label, value]) => {
    doc
      .font("Bold")
      .fontSize(10)
      .text(`${label}: `, {
        continued: true,
      })
      .font("Regular")
      .text(value || "-");

    doc.moveDown(0.3);
  });

  doc.moveDown();
};

const addPrioritySection = (doc, data = {}) => {
  addSectionTitle(doc, "Öncelik Uygunluğu");

  addLabelValue(doc, "Seçilen Öncelik", data.selectedPriority);
  addLabelValue(doc, "Değerlendirme", data.label);
  addLabelValue(doc, "Gerekçe", data.reason);
  addLabelValue(doc, "Öneri", data.recommendation);

  doc.moveDown();
};

const addFindingsSection = (doc, title, findings = []) => {
  if (!Array.isArray(findings) || findings.length === 0) {
    return;
  }

  addSectionTitle(doc, title);

  findings.forEach((item, index) => {
    ensurePageSpace(doc, 110);

    doc
      .font("Bold")
      .fontSize(11)
      .text(`${index + 1}. ${item.title || "Bulgu"}`);

    doc.moveDown(0.3);

    addLabelValue(doc, "Açıklama", item.description);
    addLabelValue(doc, "Durum", item.status);
    addLabelValue(doc, "Önem Düzeyi", item.severity);
    addLabelValue(doc, "Öneri", item.recommendation);

    doc.moveDown(0.8);
  });
};

const addTextSection = (doc, title, text) => {
  if (!text) return;

  addSectionTitle(doc, title);

  doc
    .font("Regular")
    .fontSize(10)
    .text(text, {
      align: "justify",
      lineGap: 3,
    });

  doc.moveDown();
};

const addSectionTitle = (doc, title) => {
  ensurePageSpace(doc, 70);

  doc
    .font("Bold")
    .fontSize(14)
    .text(title);

  doc
    .moveTo(doc.x, doc.y + 4)
    .lineTo(545, doc.y + 4)
    .stroke();

  doc.moveDown();
};

const addLabelValue = (doc, label, value) => {
  doc
    .font("Bold")
    .fontSize(10)
    .text(`${label}: `, {
      continued: true,
    })
    .font("Regular")
    .text(value || "-");

  doc.moveDown(0.3);
};

const ensurePageSpace = (doc, requiredSpace = 100) => {
  const bottomLimit = doc.page.height - doc.page.margins.bottom;

  if (doc.y + requiredSpace > bottomLimit) {
    doc.addPage();
  }
};

const addDisclaimer = (doc) => {
  ensurePageSpace(doc, 100);

  doc.moveDown();

  doc
    .font("Bold")
    .fontSize(10)
    .text("Sistem Notu");

  doc
    .font("Regular")
    .fontSize(9)
    .text(
      "Bu rapor yapay zeka destekli bir ön analiz çıktısıdır. Nihai idari, teknik veya mali karar yerine geçmez. Bulgular uzman incelemesiyle doğrulanmalıdır.",
      {
        align: "justify",
      }
    );
};

const addPageNumbers = (doc) => {
  const range = doc.bufferedPageRange();

  for (
    let pageIndex = range.start;
    pageIndex < range.start + range.count;
    pageIndex += 1
  ) {
    doc.switchToPage(pageIndex);

    doc
      .font("Regular")
      .fontSize(8)
      .text(
        `Sayfa ${pageIndex + 1} / ${range.count}`,
        50,
        doc.page.height - 40,
        {
          width: doc.page.width - 100,
          align: "center",
        }
      );
  }
};

const addFinalEvaluationSection = (doc, evaluation) => {
  if (!evaluation) return;

  const {
    criteria = [],
    categoryScores = [],
    totalScore = 0,
    maxScore = 100,
    overallComment,
    expertNote,
  } = evaluation;

  ensurePageSpace(doc, 160);

  addSectionTitle(doc, "Nihai Değerlendirme");

  doc
    .font("Regular")
    .fontSize(9.5)
    .text(
      "Başvuru, Teknik Destek Programı Nihai Değerlendirme Tablosunda yer alan kriterlere göre yapay zeka destekli olarak puanlanmıştır.",
      {
        align: "justify",
        lineGap: 2,
      }
    );

  doc.moveDown();

  addTotalScoreBox(doc, totalScore, maxScore);

  doc.moveDown();

  addCategoryScoresTable(doc, categoryScores);

  doc.moveDown();

  criteria.forEach((criterion) => {
    addEvaluationCriterion(doc, criterion);
  });

  if (overallComment) {
    ensurePageSpace(doc, 90);

    addSectionTitle(doc, "Nihai Değerlendirme Genel Görüşü");

    doc
      .font("Regular")
      .fontSize(10)
      .text(String(overallComment), {
        align: "justify",
        lineGap: 3,
      });

    doc.moveDown();
  }

  if (expertNote) {
    ensurePageSpace(doc, 80);

    doc
      .font("Bold")
      .fontSize(10)
      .text("Uzman Notu");

    doc
      .font("Regular")
      .fontSize(9)
      .text(String(expertNote), {
        align: "justify",
        lineGap: 2,
      });

    doc.moveDown();
  }
};

const addTotalScoreBox = (doc, totalScore, maxScore) => {
  const boxWidth = 180;
  const boxHeight = 58;
  const boxX =
    doc.page.width -
    doc.page.margins.right -
    boxWidth;

  const boxY = doc.y;

  doc
    .roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
    .fillAndStroke("#E8F1FB", "#2F75B5");

  doc
    .fillColor("#17365D")
    .font("Bold")
    .fontSize(10)
    .text("TOPLAM PUAN", boxX, boxY + 10, {
      width: boxWidth,
      align: "center",
    });

  doc
    .font("Bold")
    .fontSize(21)
    .text(
      `${totalScore} / ${maxScore}`,
      boxX,
      boxY + 28,
      {
        width: boxWidth,
        align: "center",
      }
    );

  doc.fillColor("black");
  doc.y = boxY + boxHeight + 4;
};

const addCategoryScoresTable = (
  doc,
  categoryScores = []
) => {
  if (
    !Array.isArray(categoryScores) ||
    categoryScores.length === 0
  ) {
    return;
  }

  const tableX = doc.page.margins.left;
  const tableWidth =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  const codeWidth = 35;
  const scoreWidth = 80;
  const titleWidth =
    tableWidth - codeWidth - scoreWidth;

  const rowHeight = 27;

  ensurePageSpace(
    doc,
    rowHeight * (categoryScores.length + 1) + 20
  );

  let y = doc.y;

  drawTableCell(
    doc,
    tableX,
    y,
    codeWidth,
    rowHeight,
    "Bölüm",
    true,
    "center"
  );

  drawTableCell(
    doc,
    tableX + codeWidth,
    y,
    titleWidth,
    rowHeight,
    "Değerlendirme Bölümü",
    true
  );

  drawTableCell(
    doc,
    tableX + codeWidth + titleWidth,
    y,
    scoreWidth,
    rowHeight,
    "Puan",
    true,
    "center"
  );

  y += rowHeight;

  categoryScores.forEach((category) => {
    drawTableCell(
      doc,
      tableX,
      y,
      codeWidth,
      rowHeight,
      category.code || "-",
      false,
      "center"
    );

    drawTableCell(
      doc,
      tableX + codeWidth,
      y,
      titleWidth,
      rowHeight,
      category.title || "-",
      false
    );

    drawTableCell(
      doc,
      tableX + codeWidth + titleWidth,
      y,
      scoreWidth,
      rowHeight,
      `${category.score ?? 0} / ${category.maxScore ?? 0
      }`,
      false,
      "center"
    );

    y += rowHeight;
  });

  doc.y = y + 8;
};

const addEvaluationCriterion = (
  doc,
  criterion = {}
) => {
  ensurePageSpace(doc, 145);

  const {
    code = "-",
    category = "",
    question = "",
    score = 0,
    maxScore = 0,
    reason = "",
    evidence = [],
    improvement = "",
    reviewRequired = false,
  } = criterion;

  doc
    .font("Bold")
    .fontSize(11)
    .fillColor("#17365D")
    .text(
      `${code} - ${category}  |  ${score} / ${maxScore}`
    );

  doc.fillColor("black");
  doc.moveDown(0.3);

  if (question) {
    doc
      .font("Bold")
      .fontSize(9.5)
      .text(String(question), {
        align: "justify",
        lineGap: 2,
      });

    doc.moveDown(0.4);
  }

  addLabelValue(
    doc,
    "Puan Gerekçesi",
    reason
  );

  if (
    Array.isArray(evidence) &&
    evidence.length > 0
  ) {
    doc
      .font("Bold")
      .fontSize(9.5)
      .text("Belge Kanıtları:");

    doc.moveDown(0.2);

    evidence.forEach((item) => {
      doc
        .font("Regular")
        .fontSize(9)
        .text(`• ${String(item)}`, {
          indent: 10,
          align: "justify",
          lineGap: 2,
        });
    });

    doc.moveDown(0.4);
  }

  if (improvement) {
    addLabelValue(
      doc,
      "Geliştirme Önerisi",
      improvement
    );
  }

  if (reviewRequired) {
    doc
      .font("Bold")
      .fontSize(9)
      .fillColor("#C00000")
      .text("Uzman kontrolü gereklidir.");

    doc.fillColor("black");
  }

  doc.moveDown(0.8);

  const lineY = doc.y;

  doc
    .moveTo(
      doc.page.margins.left,
      lineY
    )
    .lineTo(
      doc.page.width -
      doc.page.margins.right,
      lineY
    )
    .strokeColor("#D9E2F3")
    .stroke();

  doc.strokeColor("black");
  doc.moveDown(0.8);
};

const drawTableCell = (
  doc,
  x,
  y,
  width,
  height,
  text,
  isHeader = false,
  align = "left"
) => {
  if (isHeader) {
    doc
      .rect(x, y, width, height)
      .fillAndStroke("#D9EAF7", "#A6A6A6");
  } else {
    doc
      .rect(x, y, width, height)
      .stroke("#A6A6A6");
  }

  doc
    .fillColor("black")
    .font(isHeader ? "Bold" : "Regular")
    .fontSize(8.5)
    .text(String(text ?? "-"), x + 5, y + 8, {
      width: width - 10,
      align,
    });
};

export { generatePreliminaryReport };