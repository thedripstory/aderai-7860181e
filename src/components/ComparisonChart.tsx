import { Check, X, Zap, Clock, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const ComparisonChart = () => {
  const comparisons = [
    {
      feature: "Setup Time",
      manual: "2-3 weeks",
      aderai: "30 seconds",
      icon: Clock
    },
    {
      feature: "Technical Skills Required",
      manual: "Advanced Boolean logic",
      aderai: "None - just click",
      icon: Zap
    },
    {
      feature: "Segment Count",
      manual: "10-15 segments typically",
      aderai: "70+ pre-built segments",
      icon: TrendingUp
    },
    {
      feature: "Maintenance Time/Month",
      manual: "10+ hours",
      aderai: "Zero - automated",
      icon: Clock
    },
    {
      feature: "Cost",
      manual: "$1,500+/month in labor",
      aderai: "Just $9/month",
      icon: DollarSign
    },
    {
      feature: "AI-Powered Suggestions",
      manual: false,
      aderai: true,
      icon: Zap
    },
    {
      feature: "Performance Analytics",
      manual: "Manual tracking",
      aderai: "Real-time dashboard",
      icon: TrendingUp
    },
    {
      feature: "Segment Updates",
      manual: "Manual edits each time",
      aderai: "One-click updates",
      icon: Zap
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const }
    }
  };

  return (
    <section className="relative py-8 px-4 overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      {/* Animated background elements - more subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-muted/30 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
            y: [0, -40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-border/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Smart Choice</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent pb-1 leading-tight">
            Aderai vs Manual Segmentation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See why thousands of brands switched from manual segment creation
          </p>
        </motion.div>

        <motion.div 
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Glass card effect - neutral base */}
          <div className="absolute inset-0 bg-gradient-to-br from-card/90 via-card/80 to-card/90 backdrop-blur-xl" />
          <div className="absolute inset-[1px] rounded-3xl border border-border/50" />
          
          {/* Subtle glow on right side only for Aderai column */}
          <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent rounded-r-3xl" />

          <div className="relative">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-border/30">
              <div className="p-6 md:p-8 bg-transparent"></div>
              <motion.div 
                className="p-6 md:p-8 text-center border-x border-border/30 relative overflow-hidden bg-muted/40"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">Old Way</div>
                  <div className="text-xl md:text-2xl font-bold text-muted-foreground/80">Manual Klaviyo</div>
                </div>
              </motion.div>
              <motion.div 
                className="p-6 md:p-8 text-center relative overflow-hidden bg-primary/5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/15 to-primary/5" />
                <motion.div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative">
                  <div className="text-xs uppercase tracking-wider text-primary mb-2 flex items-center justify-center gap-2">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Modern Solution
                  </div>
                  <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Aderai
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Comparison Rows */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {comparisons.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={rowVariants}
                    className={`grid grid-cols-3 group ${idx !== comparisons.length - 1 ? 'border-b border-border/20' : ''}`}
                  >
                    {/* Feature Name */}
                    <div className="p-5 md:p-6 flex items-center gap-3 group-hover:bg-muted/20 transition-colors duration-300">
                      <motion.div 
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center border border-border/50"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-5 h-5 text-foreground/70" />
                      </motion.div>
                      <span className="font-semibold text-sm md:text-base">{item.feature}</span>
                    </div>

                    {/* Manual Column - Grey/Muted */}
                    <div className="p-5 md:p-6 border-x border-border/20 flex items-center justify-center text-center bg-muted/30 group-hover:bg-muted/40 transition-colors duration-300">
                      {typeof item.manual === 'boolean' ? (
                        item.manual ? (
                          <motion.div 
                            className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center"
                            whileHover={{ scale: 1.2 }}
                          >
                            <Check className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
                            whileHover={{ scale: 1.2 }}
                          >
                            <X className="w-5 h-5 text-destructive/70" />
                          </motion.div>
                        )
                      ) : (
                        <span className="text-muted-foreground/80 text-sm md:text-base">{item.manual}</span>
                      )}
                    </div>

                    {/* Aderai Column - Vibrant */}
                    <div className="p-5 md:p-6 flex items-center justify-center text-center relative bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
                      {typeof item.aderai === 'boolean' ? (
                        item.aderai ? (
                          <motion.div 
                            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center relative"
                            whileHover={{ scale: 1.2 }}
                          >
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-primary/30"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <Check className="w-5 h-5 text-primary relative z-10" />
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center"
                            whileHover={{ scale: 1.2 }}
                          >
                            <X className="w-5 h-5 text-destructive" />
                          </motion.div>
                        )
                      ) : (
                        <motion.span 
                          className="font-semibold text-primary text-sm md:text-base"
                          whileHover={{ scale: 1.05 }}
                        >
                          {item.aderai}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Bottom CTA */}
            <motion.div 
              className="p-8 md:p-12 text-center relative overflow-hidden border-t border-border/30"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent" />
              
              <div className="relative max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Stop wasting time on manual segments
                </h3>
                <p className="text-muted-foreground mb-8">
                  Join 500+ brands saving 10+ hours monthly while increasing revenue by 40%
                </p>
                <motion.button 
                  onClick={() => window.location.href = '/signup'}
                  className="relative group inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg overflow-hidden bg-primary hover:bg-primary/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-primary-foreground">Switch to Aderai Today</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trust Stats */}
        <motion.div 
          className="mt-8 grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { value: "500+", label: "Brands using Aderai", color: "from-primary to-primary" },
            { value: "5,000+", label: "Hours saved monthly", color: "from-accent to-accent" },
            { value: "40%", label: "Average revenue increase", color: "from-emerald-500 to-emerald-500" }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={statVariants}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-white/10 text-center overflow-hidden">
                <motion.div 
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r ${stat.color} rounded-full`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                />
                <motion.div 
                  className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonChart;
