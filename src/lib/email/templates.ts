import { siteConfig } from "@/config/site";
import { formatNaira } from "../payment/money";


type EmailOrderItem = { name: string; quantity: number; subtotal: number };

type EmailOrder = {
  orderNumber: string;
  email: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  items: EmailOrderItem[];
};

function itemsRows(items: EmailOrderItem[]): string {
  return items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name} × ${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatNaira(i.subtotal)}</td>
      </tr>`
    )
    .join("");
}

function shell(inner: string): string {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
    <h2 style="margin:0 0 16px;">${siteConfig.name}</h2>
    ${inner}
    <p style="margin-top:24px;color:#888;font-size:13px;">© ${new Date().getFullYear()} ${siteConfig.name}</p>
  </div>`;
}

export function customerOrderConfirmation(order: EmailOrder) {
  return {
    subject: `Your ${siteConfig.name} order ${order.orderNumber} is confirmed`,
    html: shell(`
      <p>Hi ${order.shippingName}, thanks for your order! We've received your payment and are getting it ready.</p>
      <p style="margin:16px 0 4px;font-weight:600;">Order ${order.orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${itemsRows(order.items)}
        <tr><td style="padding:8px 0;">Subtotal</td><td style="text-align:right;">${formatNaira(order.subtotal)}</td></tr>
        ${order.discountAmount ? `<tr><td style="padding:4px 0;">Discount</td><td style="text-align:right;">-${formatNaira(order.discountAmount)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;">Shipping</td><td style="text-align:right;">${formatNaira(order.shippingAmount)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;">Total</td><td style="text-align:right;font-weight:700;">${formatNaira(order.total)}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:14px;color:#555;">
        Shipping to: ${order.shippingLine1}${order.shippingLine2 ? ", " + order.shippingLine2 : ""}, ${order.shippingCity}, ${order.shippingState}
      </p>
    `),
  };
}

export function adminNewOrderAlert(order: EmailOrder) {
  return {
    subject: `New order ${order.orderNumber} — ${formatNaira(order.total)}`,
    html: shell(`
      <p style="font-weight:600;">A new paid order just came in.</p>
      <p>Order <strong>${order.orderNumber}</strong> · ${order.email}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${itemsRows(order.items)}
        <tr><td style="padding:8px 0;font-weight:700;">Total</td><td style="text-align:right;font-weight:700;">${formatNaira(order.total)}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:14px;">
        Ship to: ${order.shippingName}, ${order.shippingLine1}${order.shippingLine2 ? ", " + order.shippingLine2 : ""}, ${order.shippingCity}, ${order.shippingState}
      </p>
    `),
  };
}