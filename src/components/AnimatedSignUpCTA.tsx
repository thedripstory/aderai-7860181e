import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { useNavigate } from "react-router-dom";

export const AnimatedSignUpCTA = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative"
    >
      <motion.button
        onClick={() => navigate("/signup")}
        className="group relative px-10 py-5 rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Particles Background */}
        <div className="absolute inset-0">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            particleColor="#ffffff"
            speed={2}
          />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-white/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl">
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />
          <div className="absolute inset-0 rounded-2xl border-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Button Content */}
        <div className="relative z-10 flex items-center gap-4">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
          <span className="text-xl font-bold text-white tracking-wide">
            Start Building Segments
          </span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </motion.button>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-4 text-sm text-muted-foreground"
      >
        70+ segments deployed in 30 seconds
      </motion.p>
    </motion.div>
  );
};
