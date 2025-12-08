import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    navigate('/admin-dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-background)' }}>
      <InteractiveBackground />
      
      <div className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 btn-glass group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>

          {/* Admin Login Card */}
          <Card className="glass-card border-0 shadow-glass animate-scale-in">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-cyan-400 animate-pulse-gentle" />
              </div>
              <CardTitle className="text-3xl font-bold text-cyan-400">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-gray-300">
                Secure access for counselors and administrators
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your admin email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your secure password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 group relative overflow-hidden"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  <span className="relative z-10">
                    {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                  </span>
                </Button>
              </form>

              <div className="mt-6 p-4 glass-card">
                <p className="text-xs text-muted-foreground text-center">
                  This portal is restricted to authorized personnel only. 
                  All activities are monitored and logged for security purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};