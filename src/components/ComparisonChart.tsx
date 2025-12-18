import { useState } from "react";
import { Check, X, Zap, Clock, DollarSign, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ComparisonChart = () => {
  const [activeView, setActiveView] = useState<'manual' | 'aderai'>('aderai');

  const comparisons = [
    {
      feature: "Setup Time",
      manual: "2-3 weeks",
      aderai: "30 seconds",
      icon: Clock,
      highlight: true
    },
    {
      feature: "Segments",
      manual: "10-15",
      aderai: "70+",
      icon: TrendingUp,
      highlight: false
    },
    {
      feature: "Monthly Cost",
      manual: "$1,500+",
      aderai: "$9",
      icon: DollarSign,
      highlight: true
    },
    {
      feature: "Maintenance",
      manual: "10+ hrs/mo",
      aderai: "Zero",
      icon: Clock,
      highlight: false
    },
    {
      feature: "AI Suggestions",
      manual: false,
      aderai: true,
      icon: Sparkles,
      highlight: false
    },
    {
      feature: "Analytics",
      manual: "Manual",
      aderai: "Real-time",
      icon: TrendingUp,
      highlight: false
    }
  ];

  return (
    <section className="relative py-12 px-4 overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">The Smart Choice</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Why <span className="text-primary">Aderai</span>?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            See the difference in seconds
          </p>
        </motion.div>

        {/* Toggle Switch */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center p-1 rounded-full bg-muted/50 border border-border/50">
            <button
              onClick={() => setActiveView('manual')}
              className={`relative px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === 'manual' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              {activeView === 'manual' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-background border border-border/50 rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Manual Way</span>
            </button>
            <button
              onClick={() => setActiveView('aderai')}
              className={`relative px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === 'aderai' 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              {activeView === 'aderai' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Aderai
              </span>
            </button>
          </div>
        </motion.div>

        {/* Comparison Cards Grid */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {comparisons.map((item, idx) => {
              const Icon = item.icon;
              const value = activeView === 'manual' ? item.manual : item.aderai;
              const isBoolean = typeof value === 'boolean';
              const isAderai = activeView === 'aderai';
              
              return (
                <motion.div
                  key={`${item.feature}-${activeView}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                    isAderai 
                      ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10' 
                      : 'bg-muted/30 border-border/50 hover:border-border'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isAderai 
                      ? 'bg-primary/15 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  
                  {/* Value */}
                  <div className="mb-1">
                    {isBoolean ? (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        value 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                    ) : (
                      <span className={`text-xl sm:text-2xl font-bold ${
                        isAderai ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {value}
                      </span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {item.feature}
                  </span>

                  {/* Highlight badge */}
                  {item.highlight && isAderai && (
                    <motion.div 
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button 
            onClick={() => window.location.href = '/signup'}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
          <p className="mt-3 text-xs text-muted-foreground">
            No credit card required • Setup in 30 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonChart;
