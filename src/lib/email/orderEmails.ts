import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { customerOrderConfirmation, adminNewOrderAlert } from "@/lib/email/templates";

export async function sendOrderPaidEmails(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const payload = {
    orderNumber: order.orderNumber,
    email: order.email,
    shippingName: order.shippingName,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    shippingAmount: order.shippingAmount,
    total: order.total,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, subtotal: i.subtotal })),
  };

  const customer = customerOrderConfirmation(payload);
  await sendEmail({ to: order.email, subject: customer.subject, html: customer.html });

  const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminTo) {
    const admin = adminNewOrderAlert(payload);
    await sendEmail({ to: adminTo, subject: admin.subject, html: admin.html });
  }
}