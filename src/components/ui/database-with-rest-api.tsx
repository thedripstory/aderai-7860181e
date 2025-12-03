"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, RefreshCw, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

interface DatabaseWithRestApiProps {
  className?: string;
  circleText?: string;
  title?: string;
  lightColor?: string;
}

const DatabaseWithRestApi = ({
  className,
  circleText = "70+",
  title = "Instant Klaviyo Segmentation",
  lightColor = "hsl(5, 77%, 66%)",
}: DatabaseWithRestApiProps) => {
  return (
    <div className={cn("relative w-full max-w-3xl mx-auto", className)}>
      {/* Top Action Badges */}
      <div className="flex justify-center gap-6 mb-8">
        {["Connect", "Select", "Deploy", "Target"].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181b] border border-border/50 text-white text-sm font-medium shadow-lg"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {label}
          </motion.div>
        ))}
      </div>

      {/* Connection Lines SVG */}
      <div className="relative h-16 mb-4">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 60" preserveAspectRatio="xMidYMid meet">
          <g stroke="hsl(var(--muted))" fill="none" strokeWidth="1.5" strokeDasharray="200 200" pathLength="200">
            <path d="M 100 0 L 100 30 Q 100 40 110 40 L 290 40 Q 300 40 300 50 L 300 60" />
            <path d="M 230 0 L 230 20 Q 230 30 240 30 L 290 30 Q 300 30 300 40 L 300 60" />
            <path d="M 370 0 L 370 20 Q 370 30 360 30 L 310 30 Q 300 30 300 40 L 300 60" />
            <path d="M 500 0 L 500 30 Q 500 40 490 40 L 310 40 Q 300 40 300 50 L 300 60" />
            <animate
              attributeName="stroke-dashoffset"
              from="200"
              to="0"
              dur="1.5s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.25,0.1,0.5,1"
              keyTimes="0; 1"
            />
          </g>
          {/* Animated light dots */}
          <g>
            <circle className="animate-pulse" cx="300" cy="50" r="4" fill={lightColor} />
          </g>
        </svg>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Title Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#18181b] border border-primary/30 shadow-lg shadow-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">{title}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="pt-10 pb-16 px-8">
          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            {/* AI + Klaviyo */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#18181b] border border-primary/20 cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/10"
            >
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <span className="font-semibold text-white">AI</span>
              <span className="text-white/40">+</span>
              <img src={klaviyoLogo} alt="Klaviyo" className="h-5" />
            </motion.div>

            {/* 70+ Segments */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#18181b] border border-accent/20 cursor-pointer transition-shadow hover:shadow-lg hover:shadow-accent/10"
            >
              <Zap className="w-5 h-5 text-accent shrink-0" />
              <span className="font-bold text-accent">70+</span>
              <span className="font-medium text-white">Segments</span>
            </motion.div>

            {/* Real-time Sync */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#18181b] border border-green-500/20 cursor-pointer transition-shadow hover:shadow-lg hover:shadow-green-500/10"
            >
              <RefreshCw className="w-5 h-5 text-green-500 shrink-0" />
              <span className="font-medium text-white">Real-time Sync</span>
            </motion.div>

            {/* 1-Click Deploy */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#18181b] border border-blue-500/20 cursor-pointer transition-shadow hover:shadow-lg hover:shadow-blue-500/10"
            >
              <MousePointerClick className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="font-medium text-white">1-Click Deploy</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Circle Badge */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-[#1a1a1b] to-[#0d0d0e] border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/20"
          >
            <span className="text-xl font-bold text-primary">{circleText}</span>
          </motion.div>
        </div>

        {/* Decorative bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-t from-primary/10 to-transparent rounded-t-full blur-xl" />
      </motion.div>

      {/* Bottom shadow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-accent/15 rounded-xl blur-sm -z-10" />
    </div>
  );
};

export default DatabaseWithRestApi;
