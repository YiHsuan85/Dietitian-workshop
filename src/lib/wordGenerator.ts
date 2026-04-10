import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  HeadingLevel,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { AppState } from '../types';

const createHeaderCell = (text: string) => new TableCell({
  children: [new Paragraph({ 
    children: [new TextRun({ text, bold: true })],
    alignment: AlignmentType.CENTER 
  })],
  shading: { fill: "F1F5F9" },
  verticalAlign: VerticalAlign.CENTER,
});

const createValueCell = (text: string) => new TableCell({
  children: [new Paragraph({ text: text || "N/A" })],
  verticalAlign: VerticalAlign.CENTER,
});

export const generateWordDoc = async (state: AppState) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "營養諮詢紀錄 (NCP Record)",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // Basic Info
        new Paragraph({
          children: [
            new TextRun({ text: `姓名: ${state.clientHx.name || "未填寫"}`, bold: true }),
            new TextRun({ text: `\t諮詢日期: ${state.consultDate}`, bold: true }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `諮詢目標: ${state.goal || "未填寫"}`, bold: true }),
          ],
          spacing: { after: 400 },
        }),

        // 1. Assessment
        new Paragraph({
          text: "一、營養評估 (Nutrition Assessment)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({ text: "1. 個案史 (Client Hx)", heading: HeadingLevel.HEADING_3 }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("性別"), createValueCell(state.clientHx.gender),
                createHeaderCell("生日"), createValueCell(state.clientHx.birthday),
              ],
            }),
            new TableRow({
              children: [
                createHeaderCell("工作狀況"), createValueCell(state.clientHx.job),
                createHeaderCell("宗教/禁忌"), createValueCell(state.clientHx.region),
              ],
            }),
            new TableRow({
              children: [
                createHeaderCell("既往病史"), createValueCell(state.clientHx.medicalHx.join(", ") + (state.clientHx.medicalHxOther ? ` (${state.clientHx.medicalHxOther})` : "")),
                createHeaderCell("家族史"), createValueCell(state.clientHx.familyHx),
              ],
            }),
            new TableRow({
              children: [
                createHeaderCell("社會史"), createValueCell(state.clientHx.socialHx),
                createHeaderCell("生活習慣"), createValueCell(`${state.clientHx.habits.smoke ? "抽菸 " : ""}${state.clientHx.habits.drink ? "喝酒" : ""}` || "無"),
              ],
            }),
          ],
        }),

        new Paragraph({ text: "2. 體位測量 (Anthropometry)", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("身高 (cm)"), createValueCell(state.anthropometry.height),
                createHeaderCell("體重 (kg)"), createValueCell(state.anthropometry.weight),
              ],
            }),
            new TableRow({
              children: [
                createHeaderCell("BMI"), createValueCell(state.anthropometry.bmi),
                createHeaderCell("IBW / ABW"), createValueCell(`${state.anthropometry.ibw} / ${state.anthropometry.abw}`),
              ],
            }),
            new TableRow({
              children: [
                createHeaderCell("體脂率 (%)"), createValueCell(state.anthropometry.bodyFat),
                createHeaderCell("水腫狀況"), createValueCell(state.anthropometry.edema),
              ],
            }),
          ],
        }),

        new Paragraph({ text: "3. 生化數值 (Biochemistry)", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: Object.entries(state.biochemistry).reduce((acc: TableRow[], [key, val], idx) => {
            if (idx % 3 === 0) {
              acc.push(new TableRow({ children: [] }));
            }
            const currentRow = acc[acc.length - 1];
            currentRow.addChildElement(createHeaderCell(key));
            currentRow.addChildElement(createValueCell(val));
            return acc;
          }, []),
        }),

        new Paragraph({ text: "4. 飲食史 (Diet Hx)", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Paragraph({ text: `飲食型態: ${state.diet.type} / 傾向: ${state.diet.preference}` }),
        new Paragraph({ text: `飲水量: ${state.diet.currentWater} ml/d` }),
        new Paragraph({ text: `保健品: ${state.diet.supplements || "無"}` }),

        // 2. Diagnosis
        new Paragraph({
          text: "二、營養診斷 (Nutrition Diagnosis)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...state.diagnoses.map((pes, idx) => 
          new Paragraph({
            children: [
              new TextRun({ text: `PES ${idx + 1}: `, bold: true }),
              new TextRun({ text: `${pes.problem} (P) 相關於 ${pes.etiology} (E) 經由 ${pes.symptom} (S) 證實。` }),
            ],
            spacing: { after: 100 },
          })
        ),
        state.diagnoses.length === 0 ? new Paragraph({ text: "尚無診斷紀錄" }) : new Paragraph({ text: "" }),

        // 3. Intervention
        new Paragraph({
          text: "三、營養介入 (Nutrition Intervention)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({ text: `飲食計畫類型: ${state.intervention.dietType}` }),
        new Paragraph({ text: `衛教重點: ${state.intervention.educationTopics.join(", ") || "無"}` }),
        new Paragraph({ text: `轉介建議: ${state.intervention.referral || "無"}` }),
        
        new Paragraph({ text: "飲食計畫 (Meal Plan)", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("餐次"), 
                createHeaderCell("內容"),
              ],
            }),
            ...["早餐", "早點", "午餐", "午點", "晚餐", "晚點"].map(meal => {
              const mealKeyMap: any = {
                "早餐": "breakfast",
                "早點": "morningSnack",
                "午餐": "lunch",
                "午點": "afternoonSnack",
                "晚餐": "dinner",
                "晚點": "eveningSnack"
              };
              const content = Object.values(state.intervention.mealPlan).map(cat => (cat as any)[mealKeyMap[meal]]).filter(Boolean).join(", ");
              return new TableRow({
                children: [
                  createHeaderCell(meal),
                  createValueCell(content || "依計畫執行"),
                ]
              });
            })
          ]
        }),

        // 4. Monitoring
        new Paragraph({
          text: "四、營養監測 (Nutrition Monitoring)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({ text: `下次追蹤日期: ${state.monitoring.nextDate || "未定"}` }),
        new Paragraph({ text: `監測計畫: ${state.monitoring.plan || "無"}` }),
        
        new Paragraph({ text: "追蹤紀錄 (History)", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("日期"), createHeaderCell("體重"), createHeaderCell("HbA1c"), createHeaderCell("eGFR"), createHeaderCell("TG/LDL")
              ]
            }),
            ...state.monitoring.history.map(record => new TableRow({
              children: [
                createValueCell(record.date),
                createValueCell(record.weight),
                createValueCell(record.hba1c),
                createValueCell(record.egfr),
                createValueCell(`${record.tg}/${record.ldl}`)
              ]
            }))
          ]
        }),

        new Paragraph({
          text: "\n\n營養師簽章: ____________________",
          alignment: AlignmentType.RIGHT,
          spacing: { before: 800 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `營養諮詢紀錄_${state.clientHx.name || "未命名"}_${state.consultDate}.docx`);
};
