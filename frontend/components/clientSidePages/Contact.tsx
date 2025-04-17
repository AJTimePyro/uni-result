'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mail, Phone, MapPin, CheckCircle2, AlertCircle, MessageSquare, Loader2 } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { submitContactForm } from '@/queries'
import { useMutation } from '@tanstack/react-query'

// 3D Space background component
const SpaceBackground = () => (
  <div className="fixed inset-0 z-0">
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  </div>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: ''
  })
  
  const formRef = useRef<HTMLFormElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Use React Query mutation for form submission
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      showNotification('success', 'Your cosmic message has been sent! We\'ll respond shortly.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      if (formRef.current) {
        formRef.current.reset();
      }
    },
    onError: (error: any) => {
      showNotification('error', error?.message || 'Failed to send message. Please try again later.');
    }
  });

  // Focus the name input on component mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      show: true,
      type,
      message
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      showNotification('error', 'Please fill all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }
    
    // Submit the form
    mutate(formData);
  }

  const starElements = Array.from({ length: 50 }).map((_, i) => (
    <motion.div
      key={i}
      initial={{ opacity: Math.random() * 0.7 + 0.3 }}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ 
        duration: Math.random() * 3 + 2, 
        repeat: Infinity,
        delay: Math.random() * 5 
      }}
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 3D Space Background */}
      <SpaceBackground />
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="text-white" size={20} />
            ) : (
              <AlertCircle className="text-white" size={20} />
            )}
            <p className="text-white">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-20 px-4 min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 text-center"
        >
          Connect With The Cosmos
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-base md:text-xl mb-8 text-white max-w-2xl px-4 text-center"
        >
          Reach out to our interstellar support team for any academic or technical questions.
        </motion.p>
      
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(99, 102, 241, 0.3)" }}
                className="bg-indigo-900/30 backdrop-blur-md border border-indigo-500/30 rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <MessageSquare className="mr-2 text-indigo-400" />
                  Cosmic Contact Hub
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-indigo-900/50 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-indigo-300 font-medium">Headquarters</h3>
                      <p className="text-gray-300">Galaxy Tower, Cosmic Avenue</p>
                      <p className="text-gray-300">Universe City, UC 42069</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-900/50 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-indigo-300 font-medium">Email Transmissions</h3>
                      <a href="mailto:support@galacticresults.edu" className="text-gray-300 hover:text-white hover:underline transition-colors">support@galacticresults.edu</a>
                      <p className="text-gray-300">admissions@galacticresults.edu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-900/50 p-3 rounded-lg mr-4">
                      <Phone className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-indigo-300 font-medium">Interstellar Communications</h3>
                      <a href="tel:+18882667672" className="text-gray-300 hover:text-white hover:underline transition-colors">+1 (888) COSMOS-42</a>
                      <p className="text-gray-300">+1 (888) 555-1234</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(99, 102, 241, 0.3)" }}
                className="bg-indigo-900/30 backdrop-blur-md border border-indigo-500/30 rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="mr-2 text-indigo-400"
                  >
                    ⏰
                  </motion.div>
                  Transmission Hours
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-indigo-800/30 pb-2">
                    <span className="text-indigo-300">Monday - Friday:</span>
                    <span className="text-gray-300">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-indigo-800/30 pb-2">
                    <span className="text-indigo-300">Saturday:</span>
                    <span className="text-gray-300">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Sunday:</span>
                    <span className="text-gray-300">Closed (Cosmic Rest Day)</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <motion.div 
                whileHover={{ boxShadow: "0px 10px 25px rgba(99, 102, 241, 0.4)" }}
                className="bg-indigo-900/30 backdrop-blur-md border border-indigo-500/30 rounded-xl p-6 md:p-8 shadow-lg h-full"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Send className="mr-2 text-indigo-400" />
                  Send a Cosmic Message
                </h2>
                
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-indigo-300 mb-2">
                        Name <span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        ref={nameInputRef}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-lg bg-indigo-950/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        required
                        disabled={isPending || isSuccess}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-indigo-300 mb-2">
                        Email <span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 rounded-lg bg-indigo-950/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        required
                        disabled={isPending || isSuccess}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-indigo-300 mb-2">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is your message about?"
                      className="w-full px-4 py-3 rounded-lg bg-indigo-950/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                      disabled={isPending || isSuccess}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-indigo-300 mb-2">
                      Message <span className="text-pink-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 rounded-lg bg-indigo-950/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white min-h-[150px] resize-y"
                      required
                      disabled={isPending || isSuccess}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-center sm:justify-start">
                    <button type="submit" className="hidden">Submit</button>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px #6366f1" }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isPending || isSuccess}
                      className="relative px-8 py-3 overflow-hidden rounded-lg cosmic-gradient text-white font-semibold transition duration-300 transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Transmitting...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Message Sent!
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <motion.div
              whileHover={{ boxShadow: "0px 10px 25px rgba(99, 102, 241, 0.4)" }}
              className="bg-indigo-900/30 backdrop-blur-md border border-indigo-500/30 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <MapPin className="mr-2 text-indigo-400" />
                Our Cosmic Location
              </h2>
              
              <div className="bg-indigo-950/70 rounded-lg h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden">
                {/* Interactive cosmic location visualization */}
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-purple-900/30"></div>
                  
                  {/* Center point */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-24 h-24 rounded-full bg-indigo-600/30 flex items-center justify-center border-4 border-indigo-500"
                    >
                      <MapPin className="h-12 w-12 text-indigo-400" />
                    </motion.div>
                    <p className="mt-4 text-indigo-300 font-bold text-lg text-center">Galaxy Tower</p>
                    <p className="text-gray-400 text-center">The center of the academic universe</p>
                  </div>
                  
                  {/* Decorative stars */}
                  {starElements}
                  
                  {/* Orbiting planets */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full border border-indigo-500/30"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    <motion.div
                      className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"
                    />
                  </motion.div>
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-purple-500/20"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    <motion.div
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-purple-400 rounded-full"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 