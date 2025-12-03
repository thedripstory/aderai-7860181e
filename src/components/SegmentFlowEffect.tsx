"use client";
import { useScroll, useTransform } from "framer-motion";
import React from "react";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

export const SegmentFlowEffect = () => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 1], [0, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 1], [0, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 1], [0, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 1], [0, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 1], [0, 1.2]);

  return (
    <div
      className="h-[150vh] bg-background w-full relative overflow-hidden"
      ref={ref}
    >
      <GoogleGeminiEffect
        title="Segments that flow into Klaviyo"
        description="Watch your customer data transform into powerful segments — automatically synced and ready for targeting."
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />
    </div>
  );
};
