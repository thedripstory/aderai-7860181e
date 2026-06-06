"use client";

import React from "react";
import { motion } from "motion/react";
import { Folder, HeartHandshakeIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseWithRestApiProps {
  className?: string;
  circleText?: string;
  badgeTexts?: {
    first: string;
    second: string;
    third: string;
    fourth: string;
  };
  buttonTexts?: {
    first: string;
    second: string;
  };
  title?: string;
  lightColor?: string;
}

const DatabaseWithRestApi = ({
  className,
  circleText,
  badgeTexts,
  buttonTexts,
  title,
  lightColor,
}: DatabaseWithRestApiProps) => {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[700px] flex-col items-center",
        "h-[420px] sm:h-[440px] lg:h-[470px]",
        className
      )}
    >
      {/* SVG Paths  */}
      <svg
        className="h-full sm:w-full text-muted"
        width="100%"
        height="100%"
        viewBox="0 0 200 100"
      >
        <g
          stroke="currentColor"
          fill="none"
          strokeWidth="0.4"
          strokeDasharray="100 100"
          pathLength="100"
        >
          <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
          <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
          <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
          <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />
          {/* Animation For Path Starting */}
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        </g>
        {/* Blue Lights */}
        <g mask="url(#db-mask-1)">
          <circle
            className="database db-light-1"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-blue-grad)"
          />
        </g>
        <g mask="url(#db-mask-2)">
          <circle
            className="database db-light-2"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-blue-grad)"
          />
        </g>
        <g mask="url(#db-mask-3)">
          <circle
            className="database db-light-3"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-blue-grad)"
          />
        </g>
        <g mask="url(#db-mask-4)">
          <circle
            className="database db-light-4"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-blue-grad)"
          />
        </g>
        {/* Buttons */}
        <g stroke="currentColor" fill="none" strokeWidth="0.4">
          {/* First Button */}
          <g className="db-badge-group">
            <rect
              className="db-badge-rect"
              fill="#18181B"
              x="4"
              y="5"
              width="42"
              height="10"
              rx="5"
            ></rect>
            <DatabaseIcon x="8" y="7.5"></DatabaseIcon>
            <text
              x="17"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {badgeTexts?.first || "GET"}
            </text>
          </g>
          {/* Second Button */}
          <g className="db-badge-group">
            <rect
              className="db-badge-rect"
              fill="#18181B"
              x="54"
              y="5"
              width="36"
              height="10"
              rx="5"
            ></rect>
            <DatabaseIcon x="58" y="7.5"></DatabaseIcon>
            <text
              x="67"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {badgeTexts?.second || "POST"}
            </text>
          </g>
          {/* Third Button */}
          <g className="db-badge-group">
            <rect
              className="db-badge-rect"
              fill="#18181B"
              x="108"
              y="5"
              width="38"
              height="10"
              rx="5"
            ></rect>
            <DatabaseIcon x="112" y="7.5"></DatabaseIcon>
            <text
              x="121"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {badgeTexts?.third || "PUT"}
            </text>
          </g>
          {/* Fourth Button */}
          <g className="db-badge-group">
            <rect
              className="db-badge-rect"
              fill="#18181B"
              x="156"
              y="5"
              width="38"
              height="10"
              rx="5"
            ></rect>
            <DatabaseIcon x="160" y="7.5"></DatabaseIcon>
            <text
              x="169"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {badgeTexts?.fourth || "DELETE"}
            </text>
          </g>
        </g>
        <defs>
          {/* 1 -  user list */}
          <mask id="db-mask-1">
            <path
              d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* 2 - task list */}
          <mask id="db-mask-2">
            <path
              d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* 3 - backlogs */}
          <mask id="db-mask-3">
            <path
              d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* 4 - misc */}
          <mask id="db-mask-4">
            <path
              d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* Blue Grad */}
          <radialGradient id="db-blue-grad" fx="1">
            <stop offset="0%" stopColor={lightColor || "#00A6F5"} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
      {/* Main Box */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex w-full max-w-full flex-col items-center px-2">
        {/* bottom shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-[140px] w-[70%] rounded-xl bg-accent/20 blur-xl" />
        {/* box title */}
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center rounded-xl border border-primary/30 bg-[#101112] px-3 sm:px-4 py-2 shadow-lg shadow-primary/10"
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(5, 77%, 66%, 0.3)" }}
          transition={{ duration: 0.2 }}
        >
          <SparklesIcon className="size-4 text-primary shrink-0" />
          <span className="ml-2 text-xs sm:text-sm font-medium text-white whitespace-nowrap">
            {title ? title : "Data exchange using a customized REST API"}
          </span>
        </motion.div>

        {/* box content */}
        <div className="relative z-10 mx-auto flex h-[220px] sm:h-[210px] w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm shadow-2xl">
          {/* Pulsing rings behind the hub (slowed down) */}
          <motion.div
            className="absolute h-[110px] w-[110px] rounded-full border border-primary/25 bg-primary/5"
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[170px] w-[170px] rounded-full border border-primary/15"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute h-[230px] w-[230px] rounded-full border border-primary/10"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* ============ DESKTOP / TABLET: horizontal layout (≥640px) ============ */}
          <div className="hidden sm:flex relative z-10 w-full items-center justify-between px-3 md:px-4 gap-1">
            {/* Left badge: aderai */}
            <motion.div
              className="relative flex items-center gap-2 h-9 rounded-full bg-[#101112] px-4 text-sm border border-primary/30 cursor-pointer shadow-lg shadow-primary/10"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px hsl(5, 77%, 66%, 0.35)", borderColor: "hsl(5, 77%, 66%, 0.6)" }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <HeartHandshakeIcon className="size-4 text-primary shrink-0" />
              <span className="font-medium text-white whitespace-nowrap">{buttonTexts?.first || "LegionDev"}</span>
            </motion.div>

            {/* Connector + particle stream — fills the gap between badges & hub */}
            <div className="flex-1 relative h-px mx-3">
              {/* baseline dashed lines */}
              <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="50%" x2="50%" y2="50%" stroke="hsl(5, 77%, 66%)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="hsl(5, 100%, 64%)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
              {/* Left → hub particle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(5,77%,66%,0.8)]"
                initial={{ left: "0%" }}
                animate={{ left: ["0%", "50%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn" }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_1px_hsl(5,77%,66%,0.6)]"
                initial={{ left: "0%" }}
                animate={{ left: ["0%", "50%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", delay: 0.8 }}
              />
              {/* Right → hub particle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_2px_hsl(5,100%,64%,0.8)]"
                initial={{ left: "100%" }}
                animate={{ left: ["100%", "50%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", delay: 0.4 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent/70 shadow-[0_0_6px_1px_hsl(5,100%,64%,0.6)]"
                initial={{ left: "100%" }}
                animate={{ left: ["100%", "50%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", delay: 1.2 }}
              />
            </div>

            {/* Center hub (with arrival pulse synced to particle cadence) */}
            <motion.div
              className="relative z-20 grid h-[78px] w-[78px] md:h-[88px] md:w-[88px] shrink-0 place-items-center rounded-full border border-primary/40 bg-gradient-to-b from-[#1d1d1f] to-[#0d0d0e] font-bold text-xl md:text-2xl text-primary shadow-[inset_0_0_20px_hsl(5,77%,66%,0.15),0_0_40px_hsl(5,77%,66%,0.3)]"
              animate={{ scale: [1, 1.04, 1, 1.04, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }}
              whileHover={{ scale: 1.1, boxShadow: "inset 0 0 20px hsl(5, 77%, 66%, 0.2), 0 0 60px hsl(5, 77%, 66%, 0.55)" }}
            >
              <div className="absolute inset-1 rounded-full border border-primary/20" />
              <span className="relative">{circleText ? circleText : "SVG"}</span>
            </motion.div>

            {/* Right connector + particle stream */}
            <div className="flex-1 relative h-px mx-3">
              <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="hsl(5, 100%, 64%)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_2px_hsl(5,100%,64%,0.8)]"
                initial={{ left: "100%" }}
                animate={{ left: ["100%", "0%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", delay: 0.2 }}
              />
            </div>

            {/* Right badge: 70+ Segments */}
            <motion.div
              className="relative flex items-center gap-2 h-9 rounded-full bg-[#101112] px-4 text-sm border border-accent/30 cursor-pointer shadow-lg shadow-accent/10"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px hsl(5, 100%, 64%, 0.35)", borderColor: "hsl(5, 100%, 64%, 0.6)" }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent/60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <Folder className="size-4 text-accent shrink-0" />
              <span className="font-medium text-white whitespace-nowrap">{buttonTexts?.second || "v2_updates"}</span>
            </motion.div>
          </div>

          {/* ============ MOBILE: stacked layout (<640px) ============ */}
          <div className="flex sm:hidden relative z-10 flex-col items-center justify-between h-full py-4">
            {/* Top badge */}
            <motion.div
              className="relative flex items-center gap-2 h-8 rounded-full bg-[#101112] px-3 text-xs border border-primary/30 shadow-lg shadow-primary/10"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <HeartHandshakeIcon className="size-3.5 text-primary shrink-0" />
              <span className="font-medium text-white whitespace-nowrap">{buttonTexts?.first || "LegionDev"}</span>
            </motion.div>

            {/* Vertical connector with particle (top → hub) */}
            <div className="relative w-px flex-1 my-1">
              <div className="absolute inset-0 border-l border-dashed border-primary/40" />
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(5,77%,66%,0.8)]"
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn" }}
              />
            </div>

            {/* Hub */}
            <motion.div
              className="relative z-20 grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full border border-primary/40 bg-gradient-to-b from-[#1d1d1f] to-[#0d0d0e] font-bold text-lg text-primary shadow-[inset_0_0_15px_hsl(5,77%,66%,0.15),0_0_30px_hsl(5,77%,66%,0.3)]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-1 rounded-full border border-primary/20" />
              <span className="relative">{circleText ? circleText : "SVG"}</span>
            </motion.div>

            {/* Vertical connector with particle (hub → bottom) */}
            <div className="relative w-px flex-1 my-1">
              <div className="absolute inset-0 border-l border-dashed border-accent/40" />
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_2px_hsl(5,100%,64%,0.8)]"
                initial={{ top: "100%" }}
                animate={{ top: ["100%", "0%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", delay: 0.4 }}
              />
            </div>

            {/* Bottom badge */}
            <motion.div
              className="relative flex items-center gap-2 h-8 rounded-full bg-[#101112] px-3 text-xs border border-accent/30 shadow-lg shadow-accent/10"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent/60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <Folder className="size-3.5 text-accent shrink-0" />
              <span className="font-medium text-white whitespace-nowrap">{buttonTexts?.second || "v2_updates"}</span>
            </motion.div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default DatabaseWithRestApi;

const DatabaseIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
  return (
    <svg
      x={x}
      y={y}
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
};
