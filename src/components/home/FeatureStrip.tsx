import { Truck, ArrowsClockwise, Headset, Lock } from "@phosphor-icons/react";

const features = [
  { Icon: Truck, title: "Free Shipping", sub: "On orders over ₦50,000" },
  { Icon: ArrowsClockwise, title: "Money-back", sub: "30-day guarantee" },
  { Icon: Headset, title: "Premium Support", sub: "Phone and email support" },
  { Icon: Lock, title: "Secure Payments", sub: "Secured by Paystack" },
];

export function FeatureStrip() {
  return (
    <section className="border-t border-ink/10">
      <div className="grid grid-cols-2 divide-ink/10 px-4 py-10 sm:px-6 md:grid-cols-4 md:divide-x lg:px-[50px]">
        {features.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3 px-4 py-4">
            <Icon size={28} className="text-ink" />
            <div>
              <h3 className="text-sm font-semibold text-ink">{title}</h3>
              <p className="text-xs text-ink/50">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}