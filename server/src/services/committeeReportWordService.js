import {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from "docx";

const createTextParagraph = (
    text,
    {
        bold = false,
        size = 22,
        alignment = AlignmentType.JUSTIFIED,
        spacingAfter = 120,
    } = {}
) => {
    return new Paragraph({
        alignment,
        spacing: {
            after: spacingAfter,
            line: 300,
        },
        children: [
            new TextRun({
                text: text || "",
                bold,
                size,
                font: "Arial",
            }),
        ],
    });
};

const createTitleParagraph = (text) => {
    return new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: {
            after: 300,
        },
        children: [
            new TextRun({
                text,
                bold: true,
                size: 30,
                font: "Arial",
            }),
        ],
    });
};

const createSectionHeading = (text) => {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: {
            before: 240,
            after: 140,
        },
        children: [
            new TextRun({
                text,
                bold: true,
                size: 24,
                font: "Arial",
            }),
        ],
    });
};

const cellBorders = {
    top: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "000000",
    },
    bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "000000",
    },
    left: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "000000",
    },
    right: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "000000",
    },
};

const createCell = (
    text,
    {
        bold = false,
        width,
        alignment = AlignmentType.LEFT,
    } = {}
) => {
    return new TableCell({
        width: width
            ? {
                size: width,
                type: WidthType.PERCENTAGE,
            }
            : undefined,

        borders: cellBorders,

        margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100,
        },

        children: [
            new Paragraph({
                alignment,
                children: [
                    new TextRun({
                        text: String(text ?? ""),
                        bold,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
        ],
    });
};

const createCategoryTable = (category) => {
    const rows = [
        new TableRow({
            tableHeader: true,
            children: [
                createCell("Kriter", {
                    bold: true,
                    width: 12,
                    alignment: AlignmentType.CENTER,
                }),
                createCell("Değerlendirme Kriteri", {
                    bold: true,
                    width: 53,
                    alignment: AlignmentType.CENTER,
                }),
                createCell("Puan", {
                    bold: true,
                    width: 12,
                    alignment: AlignmentType.CENTER,
                }),
                createCell("Değerlendirme Yorumu", {
                    bold: true,
                    width: 23,
                    alignment: AlignmentType.CENTER,
                }),
            ],
        }),
    ];

    for (const criterion of category.criteria) {
        rows.push(
            new TableRow({
                children: [
                    createCell(criterion.code, {
                        alignment: AlignmentType.CENTER,
                    }),
                    createCell(criterion.question),
                    createCell(
                        `${criterion.score} / ${criterion.maxScore}`,
                        {
                            alignment: AlignmentType.CENTER,
                        }
                    ),
                    createCell(criterion.comment),
                ],
            })
        );
    }

    rows.push(
        new TableRow({
            children: [
                createCell("Kategori Toplamı", {
                    bold: true,
                }),
                createCell(""),
                createCell(
                    `${category.totalScore} / ${category.maxScore}`,
                    {
                        bold: true,
                        alignment: AlignmentType.CENTER,
                    }
                ),
                createCell(""),
            ],
        })
    );

    return new Table({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        rows,
    });
};

const generateCommitteeReportWord = async ({
    committeeReport,
    analysisId,
}) => {
    const children = [
        createTitleParagraph(
            "DEĞERLENDİRME KOMİTESİ ÜYESİ RAPORU"
        ),

        createTextParagraph(
            `Analiz Kayıt No: ${analysisId}`,
            {
                bold: true,
                alignment: AlignmentType.CENTER,
                spacingAfter: 250,
            }
        ),
    ];

    for (const category of committeeReport.categories) {
        children.push(
            createSectionHeading(
                `${category.code}. ${category.title}`
            )
        );

        children.push(createCategoryTable(category));

        children.push(
            createTextParagraph("Olumlu Değerlendirme", {
                bold: true,
                spacingAfter: 80,
            })
        );

        children.push(
            createTextParagraph(category.positiveComment)
        );

        children.push(
            createTextParagraph("Olumsuz Değerlendirme", {
                bold: true,
                spacingAfter: 80,
            })
        );

        children.push(
            createTextParagraph(category.negativeComment)
        );
    }

    children.push(
        createSectionHeading("Genel Değerlendirme")
    );

    children.push(
        createTextParagraph("Genel Olumlu Açıklama", {
            bold: true,
            spacingAfter: 80,
        })
    );

    children.push(
        createTextParagraph(
            committeeReport.overallPositive
        )
    );

    children.push(
        createTextParagraph("Genel Olumsuz Açıklama", {
            bold: true,
            spacingAfter: 80,
        })
    );

    children.push(
        createTextParagraph(
            committeeReport.overallNegative
        )
    );

    children.push(
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: {
                before: 300,
            },
            children: [
                new TextRun({
                    text: `Toplam Puan: ${committeeReport.totalScore} / ${committeeReport.maximumScore}`,
                    bold: true,
                    size: 24,
                    font: "Arial",
                }),
            ],
        })
    );

    const document = new Document({
        creator: "PYB AI Analysis",
        title: "Değerlendirme Komitesi Üyesi Raporu",
        description:
            "Teknik Destek Programı Komite Üyesi Değerlendirme Raporu",

        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 900,
                            right: 700,
                            bottom: 900,
                            left: 700,
                        },
                    },
                },
                children,
            },
        ],
    });

    return Packer.toBuffer(document);
};

export default generateCommitteeReportWord;