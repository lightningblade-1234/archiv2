import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  Phone,
  MessageSquare,
  Star,
  Award,
  MapPin,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { ShimmerCard } from '@/components/LoadingSpinner';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  experience: string;
  available: boolean;
  imageUrl?: string;
  bio: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface BookingData {
  counselorId: string;
  date: Date | undefined;
  timeSlot: string;
  sessionType: 'video' | 'audio' | 'chat';
  reason: string;
  notes: string;
}

export function BookSession() {
  const [step, setStep] = useState(1);
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingData, setBookingData] = useState<BookingData>({
    counselorId: '',
    date: undefined,
    timeSlot: '',
    sessionType: 'video',
    reason: '',
    notes: ''
  });
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const sessionTypes = [
    { value: 'video', label: 'Video Call', icon: Video },
    { value: 'audio', label: 'Voice Call', icon: Phone },
    { value: 'chat', label: 'Chat Session', icon: MessageSquare },
  ];

  const reasonOptions = [
    "Academic Stress",
    "Anxiety & Depression",
    "Relationship Issues",
    "Career Guidance",
    "Personal Development",
    "Other"
  ];

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: true },
    { id: '4', time: '02:00 PM', available: true },
    { id: '5', time: '03:00 PM', available: true },
    { id: '6', time: '04:00 PM', available: true },
  ];

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const { data, error } = await supabase
          .from('counselors')
          .select('*')
          .order('name');

        if (error) throw error;

        if (data) {
          setCounselors(data.map(c => ({
            ...c,
            available: c.is_available // Map is_available to available
          })));
        }
      } catch (error) {
        console.error('Error fetching counselors:', error);
        toast({
          title: "Error",
          description: "Failed to load counselors. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounselors();
  }, [toast]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedCounselor || !selectedDate) return;

      try {
        // Start of the selected day
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);

        // End of the selected day
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('sessions')
          .select('time_slot')
          .eq('counselor_id', selectedCounselor)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .neq('status', 'cancelled'); // Don't count cancelled sessions

        if (error) throw error;

        if (data) {
          setBookedSlots(data.map(s => s.time_slot));
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [selectedCounselor, selectedDate]);

  const handleCounselorSelect = (counselorId: string) => {
    setSelectedCounselor(counselorId);
    setBookingData(prev => ({ ...prev, counselorId }));
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setBookingData(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (timeSlot: string) => {
    setBookingData(prev => ({ ...prev, timeSlot }));
    setStep(3);
  };

  const handleBookingSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to book a session.",
          variant: "destructive"
        });
        return;
      }

      if (!bookingData.date) return;

      // Combine date and time into a single timestamp
      const sessionDate = new Date(bookingData.date);
      const [time, modifier] = bookingData.timeSlot.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      sessionDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      const { error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          counselor_id: bookingData.counselorId,
          date: sessionDate.toISOString(),
          time_slot: bookingData.timeSlot,
          session_type: bookingData.sessionType,
          reason: bookingData.reason,
          notes: bookingData.notes,
          status: 'pending'
        });

      if (error) throw error;

      setStep(4);
      toast({
        title: "Success",
        description: "Your session has been booked successfully.",
      });

      // Log activity
      try {
        await fetch('/api/activities/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            activity_type: 'booking',
            title: 'Scheduled Counseling Session',
            details: {
              counselor_id: bookingData.counselorId,
              date: sessionDate.toISOString(),
              time_slot: bookingData.timeSlot
            }
          })
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }

    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedCounselor(null);
    setSelectedDate(undefined);
    setBookingData({
      counselorId: '',
      date: undefined,
      timeSlot: '',
      sessionType: 'video',
      reason: '',
      notes: ''
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="student">
        <div className="space-y-8">
          <ShimmerCard className="h-32" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (step === 4) {
    const selectedCounselorData = counselors.find(c => c.id === bookingData.counselorId);
    return (
      <DashboardLayout userType="student">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card className="glass-card border-0 text-center">
            <CardHeader className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-green-600 mb-2">Booking Confirmed!</CardTitle>
                <CardDescription className="text-lg">
                  Your counseling session has been successfully scheduled
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-wellness-calm/20 to-wellness-peaceful/20 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-semibold">Session Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-wellness-calm" />
                    <span><strong>Counselor:</strong> {selectedCounselorData?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-wellness-serene" />
                    <span><strong>Date:</strong> {bookingData.date ? format(bookingData.date, 'MMMM d, yyyy') : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-wellness-peaceful" />
                    <span><strong>Time:</strong> {bookingData.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sessionTypes.find(t => t.value === bookingData.sessionType)?.icon && (
                      React.createElement(sessionTypes.find(t => t.value === bookingData.sessionType)!.icon, { className: "w-4 h-4 text-wellness-warm" })
                    )}
                    <span><strong>Type:</strong> {sessionTypes.find(t => t.value === bookingData.sessionType)?.label}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground">
                  You'll receive a confirmation email with session details and access instructions.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={resetBooking} variant="outline" className="btn-glass">
                    Book Another Session
                  </Button>
                  <Button className="btn-hero">
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="glass-card p-8 text-center tilt-card">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent mb-4">
            Schedule a Counseling Session
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            We're here to support you on your mental wellness journey. Take the first step towards feeling better.
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4 max-w-md mx-auto">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= stepNumber
                  ? 'bg-wellness-calm text-white'
                  : 'bg-gray-200 text-gray-500'
                  }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ${step > stepNumber ? 'bg-wellness-calm' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            <span>Counselor</span>
            <span>Date & Time</span>
            <span>Details</span>
          </div>
        </div>

        {/* Step 1: Select Counselor */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">Choose Your Counselor</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {counselors.map((counselor, index) => (
                <Card
                  key={counselor.id}
                  className={`glass-card border-0 hover:shadow-xl transition-all duration-500 cursor-pointer tilt-card group ${!counselor.available ? 'opacity-60' : ''
                    }`}
                  onClick={() => counselor.available && handleCounselorSelect(counselor.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{counselor.name}</CardTitle>
                          <CardDescription>{counselor.title}</CardDescription>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{counselor.rating}</span>
                            <span className="text-sm text-muted-foreground">• {counselor.experience}</span>
                          </div>
                        </div>
                      </div>
                      {counselor.available ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          Busy
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{counselor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {counselor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full btn-glass group-hover:bg-white/30"
                      disabled={!counselor.available}
                    >
                      {counselor.available ? 'Book Now' : 'Currently Unavailable'}
                      {counselor.available && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && selectedCounselor && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Select Date & Time</h2>
              <p className="text-muted-foreground">
                Booking with {counselors.find(c => c.id === selectedCounselor)?.name}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < startOfToday()}
                    className="rounded-md border-0 pointer-events-auto"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Available Times
                  </CardTitle>
                  <CardDescription>
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Please select a date first'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot.time);
                        const isAvailable = slot.available && !isBooked;
                        return (
                          <Button
                            key={slot.id}
                            onClick={() => isAvailable && handleTimeSelect(slot.time)}
                            variant={isAvailable ? "outline" : "secondary"}
                            disabled={!isAvailable}
                            className={`btn-glass ${isAvailable ? 'hover:bg-white/30' : 'opacity-50'}`}
                          >
                            {slot.time}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Select a date to view available time slots
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Booking Summary Panel */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-calm/10 to-wellness-peaceful/10">
                      <User className="w-5 h-5 text-wellness-calm" />
                      <div>
                        <p className="font-medium text-sm">Counselor</p>
                        <p className="text-sm text-muted-foreground">
                          {counselors.find(c => c.id === selectedCounselor)?.name || 'Not selected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-serene/10 to-wellness-warm/10">
                      <CalendarIcon className="w-5 h-5 text-wellness-serene" />
                      <div>
                        <p className="font-medium text-sm">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Not selected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-peaceful/10 to-wellness-warm/10">
                      <Clock className="w-5 h-5 text-wellness-peaceful" />
                      <div>
                        <p className="font-medium text-sm">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {bookingData.timeSlot || 'Not selected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <p className="text-xs text-muted-foreground text-center">
                      Complete your selection to proceed to session details
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={() => setStep(1)} variant="outline" className="btn-glass">
                Back to Counselors
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Session Details */}
        {step === 3 && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Session Details</h2>
              <p className="text-muted-foreground">
                {selectedDate && bookingData.timeSlot &&
                  `${format(selectedDate, 'MMMM d, yyyy')} at ${bookingData.timeSlot}`
                }
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Session Details Form */}
              <div className="lg:col-span-2 space-y-6">

                <Card className="glass-card border-0">
                  <CardContent className="p-6 space-y-6">
                    {/* Session Type */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Session Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {sessionTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <Button
                              key={type.value}
                              onClick={() => setBookingData(prev => ({ ...prev, sessionType: type.value as any }))}
                              variant={bookingData.sessionType === type.value ? "default" : "outline"}
                              className={`btn-glass flex flex-col items-center p-4 h-auto ${bookingData.sessionType === type.value ? 'bg-white/30' : ''
                                }`}
                            >
                              <Icon className="w-6 h-6 mb-2" />
                              <span className="text-sm">{type.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reason for Visit */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Reason for Visit</label>
                      <Select value={bookingData.reason} onValueChange={(value) => setBookingData(prev => ({ ...prev, reason: value }))}>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasonOptions.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Additional Notes (Optional)</label>
                      <Textarea
                        placeholder="Is there anything specific you'd like to discuss?"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        className="glass-input min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Summary Panel for Step 3 */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-calm/10 to-wellness-peaceful/10">
                      <User className="w-5 h-5 text-wellness-calm" />
                      <div>
                        <p className="font-medium text-sm">Counselor</p>
                        <p className="text-sm text-muted-foreground">
                          {counselors.find(c => c.id === selectedCounselor)?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-serene/10 to-wellness-warm/10">
                      <CalendarIcon className="w-5 h-5 text-wellness-serene" />
                      <div>
                        <p className="font-medium text-sm">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Not selected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-peaceful/10 to-wellness-warm/10">
                      <Clock className="w-5 h-5 text-wellness-peaceful" />
                      <div>
                        <p className="font-medium text-sm">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {bookingData.timeSlot}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-wellness-warm/10 to-wellness-serene/10">
                      {sessionTypes.find(t => t.value === bookingData.sessionType)?.icon && (
                        React.createElement(sessionTypes.find(t => t.value === bookingData.sessionType)!.icon, { className: "w-5 h-5 text-wellness-warm" })
                      )}
                      <div>
                        <p className="font-medium text-sm">Session Type</p>
                        <p className="text-sm text-muted-foreground">
                          {sessionTypes.find(t => t.value === bookingData.sessionType)?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={!bookingData.reason}
                      className="w-full btn-hero"
                    >
                      Confirm Booking
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={() => setStep(2)} variant="outline" className="btn-glass">
                Back to Date & Time
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}