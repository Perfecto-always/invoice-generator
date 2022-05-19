import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import PDFKit from "pdfkit";
import { invoice } from "../data/invoice";
import { company } from "../data/data";

export default class SendMail {
  private _email!: string;
  tableStart = 360;
  constructor() {}

  set email(email: string) {
    this._email = email;
  }

  /**
   * Nodemailer transporter
   */
  private transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
    secure: true,
  });

  /**
   * The send mail functions, which delivers the email.
   */

  async sendEmail(): Promise<SMTPTransport.SentMessageInfo> {
    if (!this._email) throw new Error("Email is required");
    const mailData: Mail.Options = {
      from: process.env.USER_EMAIL,
      to: this._email,
      subject: "Thank you for placing order",
      text: "Your Invoice",
      html: `
      <h3>Thank your for shopping with us.</h3>
      <p>Check out the invoice attached to this email for more product details.
      You can also track your order by going to website.
      </p>
      `,
      attachments: [
        {
          filename: "order.pdf",
          content: this.createPDF(),
        },
      ],
    };

    return this.transporter.sendMail(mailData);
  }

  //////////////////////////////////////////////
  // Custom PDF styling
  //////////////////////////////////////////////
  private generateHeader(doc: PDFKit.PDFDocument) {
    doc
      .fillColor("#444")
      .fontSize(30)
      .text("Invoice", 50, 50, { align: "right" })
      .fontSize(12)
      .fillColor("#aaa")
      .text("Invoice Number: " + invoice.invoice_id, 50, 80, { align: "right" })
      .moveDown(2);

    this.generateHR(doc, 110);

    doc
      .fillColor("#444")
      .text(company.name)
      .moveDown(0.3)
      .fillColor("#aaa")
      .text(company.address)
      .moveDown(0.3)
      .text(company.phone)
      .moveDown(0.3)
      .text(company.website)
      .moveDown(0.3)
      .fillColor("#333")
      .text("Balance Due:", 50, 121, { align: "right" })
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("$" + (invoice.total - invoice.paid).toFixed(2), 50, 140, {
        align: "right",
      });

    this.generateHR(doc, 195).moveDown(3);

    return this;
  }

  private generateInvoiceInformation(doc: PDFKit.PDFDocument) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#aaa")
      .text("Name:", 350)
      .moveDown(0.5)
      .text("Address:")
      .moveDown(0.5)
      .text("Invoice Date:")
      .moveDown(0.5)
      .text("Status:")
      .moveDown(0.5)
      .text("Due Date:")
      .fillColor("#444")
      .text(invoice.customer.name, 50, 235, { align: "right" })
      .moveDown(0.5)
      .text(
        invoice.customer.address + ", " + invoice.customer.city,
        50,
        undefined,
        {
          align: "right",
        }
      )
      .moveDown(0.5)
      .text(new Date().toLocaleDateString(), 50, undefined, { align: "right" })
      .moveDown(0.5)
      .text(invoice.status, 50, undefined, { align: "right" })
      .moveDown(0.5)
      .text(invoice.due_date, 50, undefined, { align: "right" });

    doc.font("Helvetica-Bold");
    return this;
  }

  private generateTableContent(doc: PDFKit.PDFDocument) {
    this.generateTableRow(
      doc,
      "Id",
      "Name",
      "Quantity",
      "Unit Price",
      "Total",
      this.tableStart
    ).font("Helvetica");

    for (let i = 0; i < invoice.order.length; i++) {
      const total = invoice.order[i].quantity * invoice.order[i].price;
      const position = (i + 1) * 20 + this.tableStart;
      this.generateTableRow(
        doc,
        invoice.order[i].product_id.toString(),
        invoice.order[i].name,
        invoice.order[i].quantity,
        invoice.order[i].price,
        total,
        position
      );
    }
    return this;
  }

  private generateTotal(doc: PDFKit.PDFDocument) {
    doc
      .text(
        "Total",
        420,
        (invoice.order.length + 1) * 20 + this.tableStart + 20
      )
      .moveDown(0.5)
      .text("Paid:")
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text("Total Due:")
      .font("Helvetica")
      .text(
        invoice.total.toString(),
        0,
        (invoice.order.length + 1) * 20 + this.tableStart + 20,
        { align: "right" }
      )
      .moveDown(0.5)
      .text(invoice.paid.toString(), 0, undefined, { align: "right" })
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text((invoice.total - invoice.paid).toString(), 0, undefined, {
        align: "right",
      });
    return this;
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    doc
      .moveDown(10)
      .font("Helvetica")
      .fontSize(12)
      .text("Note", 50)
      .fontSize(10)
      .text(
        `Thanks for shopping with us. You can track your order here: ${company.website}/track`,
        50
      )
      .moveDown(2)
      .fontSize(12)
      .text("Terms & Condition", 50)
      .fontSize(10)
      .text(
        `Read about our terms and conditions here: ${company.website}/terms`,
        50
      );
    return this;
  }

  //////////////////////////////////////////////
  // Helper functions
  //////////////////////////////////////////////
  private generateHR(doc: PDFKit.PDFDocument, y: number) {
    doc.lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
    return doc;
  }

  private generateTableRow(
    doc: PDFKit.PDFDocument,
    id: string,
    name: string,
    quantity: string | number,
    price: string | number,
    total: string | number,
    y?: number
  ) {
    doc
      .fontSize(10)
      .text(id, 50, y)
      .text(name, 150, y)
      .text(quantity.toString(), 280, y, { width: 90, align: "right" })
      .text(price.toString(), 370, y, { width: 90, align: "right" })
      .text(total.toString(), 0, y, { align: "right" })
      .moveDown(0.5);
    return doc;
  }

  //////////////////////////////////////////////
  // Final method that creates PDF
  //////////////////////////////////////////////
  createPDF() {
    const doc = new PDFKit({ size: "A4", margin: 50 });

    this.generateHeader(doc)
      .generateInvoiceInformation(doc)
      .generateTableContent(doc)
      .generateTotal(doc)
      .generateFooter(doc);

    doc.end();
    return doc.read();
  }
}
