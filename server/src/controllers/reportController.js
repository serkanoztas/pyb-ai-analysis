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

    addDisclaimer(doc);

    // addPageNumbers(doc);

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

export { generatePreliminaryReport };