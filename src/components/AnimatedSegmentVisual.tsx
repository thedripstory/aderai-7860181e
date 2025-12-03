import DatabaseWithRestApi from "@/components/ui/database-with-rest-api";
import { Zap, ArrowRight, Clock, Rocket, Users, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

export const AnimatedSegmentVisual = () => {
  return (
    <div className="relative w-full py-20 overflow-hidden">
      {/* Large ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            Instant Segmentation
          </div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold">
            <span className="text-accent">Powered</span> by{" "}
            <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] inline-block relative top-[0.05em]" />
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One click. 70+ segments. Instant deployment.
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-center mb-20">
          {/* Left stats */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">70+</div>
                  <div className="text-sm text-muted-foreground">Pre-built Segments</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Agency-grade segmentation strategies ready to deploy</p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">5</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Engagement, Lifecycle, Demographics, Behavior & Exclusions</p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">1-Click</div>
                  <div className="text-sm text-muted-foreground">Deployment</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">No manual configuration or API setup required</p>
            </div>
          </motion.div>

          {/* Center - Database Visual */}
          <motion.div 
            className="flex justify-center lg:col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <DatabaseWithRestApi
              className="scale-110 lg:scale-125"
              badgeTexts={{
                first: "Connect",
                second: "Select",
                third: "Deploy",
                fourth: "Target",
              }}
              buttonTexts={{
                first: "aderai",
                second: "70+ Segments",
              }}
              title="Instant Klaviyo Segmentation"
              circleText="70+"
              lightColor="hsl(5, 77%, 66%)"
            />
          </motion.div>

          {/* Right - Process steps */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              { step: "01", title: "Connect Klaviyo", desc: "One-click OAuth authentication" },
              { step: "02", title: "Select Segments", desc: "Choose from 70+ pre-built options" },
              { step: "03", title: "Deploy Instantly", desc: "Segments created in 30 seconds" },
              { step: "04", title: "Start Targeting", desc: "Launch personalized campaigns" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all group cursor-default"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dramatic comparison section */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-12 px-8 rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm">
            {/* Manual way */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-muted-foreground/50" />
                <span className="text-sm uppercase tracking-wider text-muted-foreground/50">Manual Setup</span>
              </div>
              <div className="text-5xl md:text-7xl font-bold text-muted-foreground/20 line-through decoration-destructive/50 decoration-4">
                10+ hrs
              </div>
              <p className="text-sm text-muted-foreground/50 mt-2">Per segment strategy</p>
            </motion.div>
            
            {/* VS divider */}
            <motion.div 
              className="relative"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7, type: "spring" }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                <Zap className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute -inset-6 rounded-full border border-primary/20 animate-pulse" style={{ animationDuration: "3s" }} />
            </motion.div>
            
            {/* Aderai way */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm uppercase tracking-wider text-primary font-medium">With Aderai</span>
              </div>
              <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                30 sec
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <img 
                  src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/black-logo-png.png" 
                  alt="Aderai" 
                  className="h-4 w-auto dark:invert"
                />
              </p>
            </motion.div>
          </div>

          {/* Bottom tagline */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground">
              Save <span className="text-primary font-semibold">1,200+ hours</span> per year on segment creation
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
