import { saveAs } from 'file-saver';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    convertInchesToTwip,
    PageOrientation,
    AlignmentType,
} from 'docx';

export const exportTestToWord = (test, showAnswers = false) => {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Arial",
                        size: 24,
                    }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(1),
                        right: convertInchesToTwip(1),
                        bottom: convertInchesToTwip(1),
                        left: convertInchesToTwip(1),
                    },
                },
            },
            children: [
                // Title
                new Paragraph({
                    children: [
                        new TextRun({
                            text: test.testName,
                            bold: true,
                            size: 36,
                            font: "Arial",
                        }),
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 },
                    alignment: AlignmentType.CENTER,
                }),
                
                // Document Type
                new Paragraph({
                    children: [
                        new TextRun({
                            text: showAnswers ? "Answer Key" : "Question Paper",
                            bold: true,
                            size: 28,
                            font: "Arial",
                            color: showAnswers ? "C00000" : "000000", // Red color for answer key
                        }),
                    ],
                    spacing: { after: 400 },
                    alignment: AlignmentType.CENTER,
                }),



                // Questions
                ...test.questions.map((question, index) => [
                    // Question Number and Text
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${index + 1}. `,
                                bold: true,
                                size: 28,
                                font: "Arial",
                            }),
                            new TextRun({
                                text: question.question,
                                size: 28,
                                font: "Arial",
                            }),
                        ],
                        spacing: { before: 400, after: 200 },
                    }),

                    // Handle text answers first
                    ...(question.type === 'text' && showAnswers ? [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Answer: ",
                                    bold: true,
                                    size: 24,
                                    font: "Arial",
                                }),
                                new TextRun({
                                    text: question.textAnswer || "(Not specified)",
                                    size: 24,
                                    font: "Arial",
                                    highlight: "yellow",
                                }),
                            ],
                            indent: { left: convertInchesToTwip(0.5) },
                            spacing: { before: 120, after: 120 },
                        })
                    ] : []),

                    // Options in a 2-column grid layout
                    ...(question.options && question.options.length > 0 ? [
                        new Table({
                            width: {
                                size: 100,
                                type: WidthType.PERCENTAGE,
                            },
                            margins: {
                                top: 100,
                                bottom: 100,
                                left: convertInchesToTwip(0.5),
                                right: 100,
                            },
                            rows: Array(Math.ceil(question.options.length / 2)).fill(0).map((_, rowIndex) => {
                                return new TableRow({
                                    children: [0, 1].map(colIndex => {
                                        const optionIndex = rowIndex * 2 + colIndex;
                                        if (optionIndex >= question.options.length) {
                                            // Empty cell for odd number of options
                                            return new TableCell({
                                                width: {
                                                    size: 50,
                                                    type: WidthType.PERCENTAGE,
                                                },
                                                children: [new Paragraph({ children: [] })],
                                            });
                                        }

                                        let isCorrectAnswer = false;
                                        if (question.type === 'mcq' || question.type === 'multiple') {
                                            isCorrectAnswer = (question.correctOptions || []).includes(optionIndex);
                                        } else if (question.type === 'truefalse') {
                                            isCorrectAnswer = question.trueFalseAnswer === (optionIndex === 0);
                                        }

                                        return new TableCell({
                                            width: {
                                                size: 50,
                                                type: WidthType.PERCENTAGE,
                                            },
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({
                                                            text: `${optionIndex + 1}`,
                                                            size: 24,
                                                            font: "Arial",
                                                            color: "666666",
                                                        }),
                                                        new TextRun({
                                                            text: "  ",
                                                            size: 24,
                                                            font: "Arial",
                                                        }),
                                                        new TextRun({
                                                            text: question.options[optionIndex],
                                                            size: 24,
                                                            font: "Arial",
                                                            bold: showAnswers && isCorrectAnswer,
                                                            highlight: showAnswers && isCorrectAnswer ? "yellow" : undefined,
                                                            color: "333333",
                                                        }),
                                                    ],
                                                }),
                                            ],
                                            borders: {
                                                top: { style: BorderStyle.NONE },
                                                bottom: { style: BorderStyle.NONE },
                                                left: { style: BorderStyle.NONE },
                                                right: { style: BorderStyle.NONE },
                                            },
                                        });
                                    }),
                                });
                            }),
                        }),
                    ] : []),
                ]).flat(),
            ],
        }]
    });

    Packer.toBlob(doc).then((blob) => {
        const suffix = showAnswers ? '_answer_key' : '_question_paper';
        saveAs(blob, `${test.testName.replace(/[^a-zA-Z0-9]/g, '_')}${suffix}.docx`);
    });
};