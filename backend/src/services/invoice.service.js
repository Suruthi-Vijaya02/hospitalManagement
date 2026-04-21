const PDFDocument = require("pdfkit");

exports.generateInvoicePDF = (bill, patient) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // --- Header ---
        doc.fillColor("#444444")
           .fontSize(20)
           .text("HMS IMPECCABLE", 50, 57)
           .fontSize(10)
           .text("123 Healthcare Blvd, Medical District", 200, 50, { align: "right" })
           .text("support@hms-impeccable.com", 200, 65, { align: "right" })
           .text("+91 98765 43210", 200, 80, { align: "right" })
           .moveDown();

        doc.strokeColor("#aaaaaa")
           .lineWidth(1)
           .moveTo(50, 100)
           .lineTo(550, 100)
           .stroke();

        // --- Patient Info ---
        doc.fontSize(12)
           .fillColor("#000000")
           .text(`INVOICE FOR: ${patient.name}`, 50, 120)
           .fontSize(10)
           .text(`UPID: ${bill.upid}`, 50, 135)
           .text(`Date: ${new Date().toLocaleDateString()}`, 50, 150)
           .text(`Status: ${bill.status.toUpperCase()}`, 50, 165, { color: bill.status === 'Paid' ? 'green' : 'red' });

        // --- Table Header ---
        const tableTop = 210;
        doc.fontSize(10)
           .text("Description", 50, tableTop, { bold: true })
           .text("Amount (INR)", 450, tableTop, { align: "right", bold: true });

        doc.strokeColor("#eeeeee")
           .moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();

        // --- Items ---
        let currentHeight = tableTop + 30;
        
        const addItem = (label, amount) => {
            if (amount <= 0) return;
            doc.text(label, 50, currentHeight)
               .text(`₹${amount.toLocaleString()}`, 450, currentHeight, { align: "right" });
            currentHeight += 20;
        };

        addItem("Out-Patient Consultation Fees", bill.consultationFee);
        addItem("Laboratory Investigation Charges", bill.labCharges);
        addItem("Pharmacy / Medicine Charges", bill.medicineCharges);
        addItem("In-Patient (IPD) Bed Charges", bill.ipdCharges);
        
        if (bill.otherCharges && bill.otherCharges.length > 0) {
            bill.otherCharges.forEach(item => {
                addItem(`Misc: ${item.description}`, item.amount);
            });
        }

        // --- Footer / Totals ---
        doc.strokeColor("#aaaaaa")
           .moveTo(50, currentHeight + 10)
           .lineTo(550, currentHeight + 10)
           .stroke();

        doc.fontSize(14)
           .text("TOTAL OUTSTANDING:", 50, currentHeight + 30)
           .text(`₹${bill.totalAmount.toLocaleString()}`, 450, currentHeight + 30, { align: "right" });

        doc.fontSize(10)
           .text("Amount Paid:", 50, currentHeight + 55)
           .text(`₹${bill.amountPaid.toLocaleString()}`, 450, currentHeight + 55, { align: "right" });

        doc.fontSize(8)
           .fillColor("#888888")
           .text("This is a computer-generated document and does not require a physical signature.", 50, 700, { align: "center", width: 500 });

        doc.end();
    });
};
