'use client'
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, User, Clock, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { AderaiLogo } from "@/components/AderaiLogo"

function SignInInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

interface SignInCardProps {
  isSignUp?: boolean;
  onToggleMode?: () => void;
  onSubmit?: (email: string, password: string, firstName?: string, brandName?: string) => Promise<void>;
  isLoading?: boolean;
}

export function SignInCard({ isSignUp = false, onToggleMode, onSubmit, isLoading = false }: SignInCardProps) {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showInactivityMessage, setShowInactivityMessage] = useState(false);
  const [showPaymentCanceledMessage, setShowPaymentCanceledMessage] = useState(false);

  // Check if redirected due to inactivity or canceled payment
  useEffect(() => {
    if (searchParams.get('reason') === 'inactivity') {
      setShowInactivityMessage(true);
    }
    if (searchParams.get('payment') === 'canceled') {
      setShowPaymentCanceledMessage(true);
    }
  }, [searchParams]);

  // For 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit) {
      await onSubmit(email, password, isSignUp ? firstName : undefined, isSignUp ? brandName : undefined);
    }
  };

  return (
    <AuroraBackground className="min-h-screen w-screen" showRadialGradient={true}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10 px-4"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow effect */}
            <motion.div 
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(255,255,255,0.03)",
                  "0 0 15px 5px rgba(255,255,255,0.05)",
                  "0 0 10px 2px rgba(255,255,255,0.03)"
                ],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatType: "mirror" 
              }}
            />

            {/* Traveling light beam effect */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              {/* Top light beam */}
              <motion.div 
                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  left: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                  opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" }
                }}
              />
              
              {/* Right light beam */}
              <motion.div 
                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-accent to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  top: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                  opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 }
                }}
              />
              
              {/* Bottom light beam */}
              <motion.div 
                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  right: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                  opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 }
                }}
              />
              
              {/* Left light beam */}
              <motion.div 
                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-accent to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  bottom: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                  opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 }
                }}
              />
              
              {/* Corner glow spots */}
              <motion.div 
                className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-accent/40 blur-[1px]"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.div 
                className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-accent/60 blur-[2px]"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-accent/60 blur-[2px]"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-accent/40 blur-[1px]"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
              />
            </div>

            {/* Card border glow */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-foreground/3 via-foreground/7 to-foreground/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            
            {/* Glass card background - brighter */}
            <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl p-8 border border-foreground/10 shadow-2xl overflow-hidden">
              {/* Subtle card inner patterns */}
              <div className="absolute inset-0 opacity-[0.03]" 
                style={{
                  backgroundImage: `linear-gradient(135deg, currentColor 0.5px, transparent 0.5px), linear-gradient(45deg, currentColor 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Logo and header */}
              <div className="text-center space-y-2 mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <Link to="/" className="inline-block">
                    <AderaiLogo size="xl" />
                  </Link>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-foreground"
                >
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-sm"
                >
                  {isSignUp ? "Get started with Aderai" : "Sign in to continue to Aderai"}
                </motion.p>
              </div>

              {/* Inactivity Message */}
              <AnimatePresence>
                {showInactivityMessage && !isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                      <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        You were logged out due to inactivity. Please sign in again.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Canceled Message */}
              <AnimatePresence>
                {showPaymentCanceledMessage && isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Payment was canceled. You can try again below.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div className="space-y-4">
                  {/* First Name input (signup only) */}
                  <AnimatePresence>
                    {isSignUp && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`relative ${focusedInput === "firstName" ? 'z-10' : ''}`}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-foreground/10 via-foreground/5 to-foreground/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "firstName" ? 'text-foreground' : 'text-muted-foreground'
                          }`} />
                          
                          <SignInInput
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onFocus={() => setFocusedInput("firstName")}
                            onBlur={() => setFocusedInput(null)}
                            required
                            className="w-full bg-foreground/5 border-foreground/10 focus:border-accent/50 text-foreground placeholder:text-muted-foreground h-12 transition-all duration-300 pl-10 pr-3 focus:bg-foreground/10 text-base"
                          />
                          
                          {focusedInput === "firstName" && (
                            <motion.div 
                              layoutId="input-highlight-firstName"
                              className="absolute inset-0 bg-foreground/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Brand Name input (signup only) */}
                  <AnimatePresence>
                    {isSignUp && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`relative ${focusedInput === "brandName" ? 'z-10' : ''}`}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-foreground/10 via-foreground/5 to-foreground/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <svg className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "brandName" ? 'text-foreground' : 'text-muted-foreground'
                          }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                          
                          <SignInInput
                            type="text"
                            placeholder="Brand name"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            onFocus={() => setFocusedInput("brandName")}
                            onBlur={() => setFocusedInput(null)}
                            required
                            className="w-full bg-foreground/5 border-foreground/10 focus:border-accent/50 text-foreground placeholder:text-muted-foreground h-12 transition-all duration-300 pl-10 pr-3 focus:bg-foreground/10 text-base"
                          />
                          
                          {focusedInput === "brandName" && (
                            <motion.div 
                              layoutId="input-highlight-brandName"
                              className="absolute inset-0 bg-foreground/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email input */}
                  <motion.div 
                    className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-foreground/10 via-foreground/5 to-foreground/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "email" ? 'text-foreground' : 'text-muted-foreground'
                      }`} />
                      
                      <SignInInput
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="w-full bg-foreground/5 border-foreground/10 focus:border-accent/50 text-foreground placeholder:text-muted-foreground h-12 transition-all duration-300 pl-10 pr-3 focus:bg-foreground/10 text-base"
                      />
                      
                      {focusedInput === "email" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-foreground/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Password input */}
                  <motion.div 
                    className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-foreground/10 via-foreground/5 to-foreground/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "password" ? 'text-foreground' : 'text-muted-foreground'
                      }`} />
                      
                      <SignInInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        required
                        minLength={8}
                        className="w-full bg-foreground/5 border-foreground/10 focus:border-accent/50 text-foreground placeholder:text-muted-foreground h-12 transition-all duration-300 pl-10 pr-10 focus:bg-foreground/10 text-base"
                      />
                      
                      {/* Toggle password visibility */}
                      <div 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 cursor-pointer"
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
                        ) : (
                          <EyeClosed className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
                        )}
                      </div>
                      
                      {focusedInput === "password" && (
                        <motion.div 
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-foreground/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Remember me & Forgot password */}
                {!isSignUp && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="appearance-none h-4 w-4 rounded border border-foreground/20 bg-foreground/5 checked:bg-accent checked:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200"
                        />
                        {rememberMe && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center text-accent-foreground pointer-events-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <label htmlFor="remember-me" className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-200">
                        Remember me
                      </label>
                    </div>
                    
                    <div className="text-sm relative group/link">
                      <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                )}

                {/* Sign in button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-6"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-accent/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                  
                  <div className="relative overflow-hidden bg-accent text-accent-foreground font-medium h-12 rounded-lg transition-all duration-300 flex items-center justify-center">
                    {/* Button background animation */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent-foreground/20 to-accent/0 -z-10"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                      style={{ opacity: isLoading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                    
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-4 h-4 border-2 border-accent-foreground/70 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          {isSignUp ? "Create Account" : "Sign In"}
                          <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {isSignUp && (
                  <p className="text-sm text-muted-foreground text-center">
                    $9/month • Cancel anytime
                  </p>
                )}

                {/* Sign up/in link */}
                <motion.p 
                  className="text-center text-sm text-muted-foreground mt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={onToggleMode}
                    className="relative inline-block group/signup"
                  >
                    <span className="relative z-10 text-foreground group-hover/signup:text-foreground/70 transition-colors duration-300 font-medium">
                      {isSignUp ? "Sign in" : "Sign up"}
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover/signup:w-full transition-all duration-300" />
                  </button>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}

export default SignInCard;
