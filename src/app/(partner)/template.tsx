"use client";

import { motion } from "motion/react";
import { pageEnter } from "@/lib/motion";

/** Route-change transition, matching the client portal's. */
export default function PartnerTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div initial="hidden" animate="visible" variants={pageEnter}>
      {children}
    </motion.div>
  );
}
