import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveBackground } from '@/components/InteractiveBackground';

export const OriginalLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Mental Wellness",
      description: "Comprehensive mental health support and resources"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy and security are our top priority"
    },
    {
      icon: Users,
      title: "Expert Counselors",
      description: "Connect with licensed mental health professionals"
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access to self-help tools and learning materials"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-background)' }}>
      <InteractiveBackground />
      
      {/* Floating Elements */}
      <div className="floating-elements">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-reveal mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 text-reveal-item">
              Haven
            </h1>
          </div>
          
          <div className="text-reveal mb-8">
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto text-reveal-item typing-effect">
              Your Journey to Mental Wellness Starts Here
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={() => navigate('/student-login')}
              className="btn-hero group relative overflow-hidden !text-gray-900"
              style={{
                transform: `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg)`,
              }}
            >
              <span className="relative z-10 text-gray-900">Student Portal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>

            <Button
              onClick={() => navigate('/admin-login')}
              className="btn-secondary group relative overflow-hidden !text-gray-900"
              style={{
                transform: `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * -0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * -0.01}deg)`,
              }}
            >
              <span className="relative z-10 text-gray-900">Counselor / Admin</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-8 text-center tilt-card animated-border"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                <feature.icon className="w-8 h-8 text-cyan-400 animate-bounce-gentle" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-white">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glass-card p-12 text-center gradient-animated">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="tilt-card">
              <div className="text-4xl font-bold text-cyan-400 mb-2">1000+</div>
              <div className="text-gray-300">Students Helped</div>
            </div>
            <div className="tilt-card">
              <div className="text-4xl font-bold text-cyan-400 mb-2">50+</div>
              <div className="text-gray-300">Expert Counselors</div>
            </div>
            <div className="tilt-card">
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400">
          <p>&copy; 2024 Haven. Your mental health matters.</p>
        </footer>
      </div>
    </div>
  );
};