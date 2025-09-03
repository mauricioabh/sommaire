import { isDev } from "./helpers";

export const pricingPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 9,
    priceId: isDev ? "price_1RlvZPHmFeCFS6dfwm4TIjP1" : "",
    description: "Perfect for occasional use",
    items: [
      "5 PDF summaries per month",
      "Standard processing speed",
      "Email support",
    ],
    paymentLink: isDev
      ? "https://buy.stripe.com/test_dRm9AT0Qu2lnaIiga27g400"
      : "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    priceId: isDev ? "price_1RlvZPHmFeCFS6dfcrLFBLoG" : "",
    description: "For professionals and teams",
    items: [
      "Unlimited PDF summaries",
      "Priority processing",
      "24/7 priority support",
      "Marldown Export",
    ],
    paymentLink: isDev
      ? "https://buy.stripe.com/test_00wfZhfLod013fQ2jc7g401"
      : "",
  },
];

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

import type { Variants } from "motion/react";

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const buttonVariants = {
  scale: 1.05,
};
