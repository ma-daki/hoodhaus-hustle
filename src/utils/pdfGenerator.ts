import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface WeeklyData {
  startDate: Date | null;
  endDate: Date | null;
  hoodiesStock: number;
  sweatshirtsStock: number;
  hoodiesSold: number;
  sweatshirtsSold: number;
  hoodiePrice: number;
  sweatshirtPrice: number;
  baleCost: number;
  weighbillCost: number;
  logisticsCost: number;
  weeklyGoal: string;
  goalStatus: string;
  weeklyRemark: string;
}

export const generatePDF = (data: WeeklyData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 51, 204); // Primary color
  doc.text("HoodHaus", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Weekly Performance Report", 105, 30, { align: "center" });
  
  // Week Period
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const weekPeriod = data.startDate && data.endDate
    ? `${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`
    : "No dates selected";
  doc.text(`Period: ${weekPeriod}`, 105, 40, { align: "center" });
  
  let yPos = 55;
  
  // Inventory Section
  doc.setFontSize(14);
  doc.setTextColor(99, 51, 204);
  doc.text("Inventory Summary", 20, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Product", "Initial Stock", "Units Sold", "Remaining"]],
    body: [
      ["Hoodies", data.hoodiesStock, data.hoodiesSold, data.hoodiesStock - data.hoodiesSold],
      ["Sweatshirts", data.sweatshirtsStock, data.sweatshirtsSold, data.sweatshirtsStock - data.sweatshirtsSold],
    ],
    theme: "grid",
    headStyles: { fillColor: [99, 51, 204] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Sales & Revenue Section
  doc.setFontSize(14);
  doc.setTextColor(99, 51, 204);
  doc.text("Sales & Revenue", 20, yPos);
  yPos += 10;
  
  const hoodieRevenue = data.hoodiePrice * data.hoodiesSold;
  const sweatshirtRevenue = data.sweatshirtPrice * data.sweatshirtsSold;
  const totalRevenue = hoodieRevenue + sweatshirtRevenue;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Product", "Unit Price (₦)", "Units Sold", "Revenue (₦)"]],
    body: [
      ["Hoodies", data.hoodiePrice.toLocaleString(), data.hoodiesSold, hoodieRevenue.toLocaleString()],
      ["Sweatshirts", data.sweatshirtPrice.toLocaleString(), data.sweatshirtsSold, sweatshirtRevenue.toLocaleString()],
      ["Total", "-", "-", totalRevenue.toLocaleString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [99, 51, 204] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Expenses Section
  doc.setFontSize(14);
  doc.setTextColor(99, 51, 204);
  doc.text("Expenses", 20, yPos);
  yPos += 10;
  
  const totalExpenses = data.baleCost + data.weighbillCost + data.logisticsCost;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Expense Type", "Amount (₦)"]],
    body: [
      ["Bale Cost", data.baleCost.toLocaleString()],
      ["Weighbill Cost", data.weighbillCost.toLocaleString()],
      ["Logistics Cost", data.logisticsCost.toLocaleString()],
      ["Total Expenses", totalExpenses.toLocaleString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [99, 51, 204] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Financial Summary
  doc.setFontSize(14);
  doc.setTextColor(99, 51, 204);
  doc.text("Financial Summary", 20, yPos);
  yPos += 10;
  
  const netProfit = totalRevenue - totalExpenses;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Amount (₦)"]],
    body: [
      ["Total Revenue", totalRevenue.toLocaleString()],
      ["Total Expenses", totalExpenses.toLocaleString()],
      ["Net Profit", netProfit.toLocaleString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [99, 51, 204] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Goals & Remarks
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(99, 51, 204);
  doc.text("Goals & Performance", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Weekly Goal: ${data.weeklyGoal || "Not set"}`, 20, yPos);
  yPos += 8;
  doc.text(`Status: ${data.goalStatus || "Not set"}`, 20, yPos);
  yPos += 8;
  doc.text("Remarks:", 20, yPos);
  yPos += 8;
  
  const remarkLines = doc.splitTextToSize(data.weeklyRemark || "No remarks", 170);
  doc.text(remarkLines, 20, yPos);
  
  // Save the PDF
  const fileName = `HoodHaus_Report_${data.startDate?.toLocaleDateString().replace(/\//g, "-") || "draft"}.pdf`;
  doc.save(fileName);
};
