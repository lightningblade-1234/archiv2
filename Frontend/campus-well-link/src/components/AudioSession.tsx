import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Play, Pause, SkipBack, SkipForward, ArrowLeft, CheckCircle2, Sparkles,
    CloudRain, Trees, Waves, Wind, Volume2, ListMusic, Headphones, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AudioSessionProps {
    resource: any;
    onBack: () => void;
}

type SessionState = 'pre-checkin' | 'playing' | 'post-checkin' | 'summary';

// LOCAL AUDIO SOURCES (Served from public/audio/)
const MAIN_TRACK_URL = '/audio/Deep_meditation.mp3';

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Soft Rain', icon: CloudRain, url: '/audio/soft-rain.mp3' },
    { id: 'forest', name: 'Forest', icon: Trees, url: '/audio/forest.mp3' },
    { id: 'waves', name: 'Ocean', icon: Waves, url: '/audio/ocean.mp3' },
    { id: 'binaural', name: 'Binaural', icon: Wind, url: '/audio/binaural.mp3' },
];

const RECOMMENDED_TRACKS = [
    {
        id: 1,
        title: 'Deep Sleep Release',
        duration: '5 min',
        category: 'Sleep',
        url: '/audio/deep-sleep-release.mp3'
    },
    {
        id: 2,
        title: 'Anxiety SOS',
        duration: '3 min',
        category: 'Anxiety',
        url: '/audio/anxiety-sos.mp3'
    },
    {
        id: 3,
        title: 'Morning Focus',
        duration: '4 min',
        category: 'Focus',
        url: '/audio/morning-focus.mp3'
    },
];

export const AudioSession: React.FC<AudioSessionProps> = ({ resource, onBack }) => {
    const [sessionState, setSessionState] = useState<SessionState>('pre-checkin');
    const [preMood, setPreMood] = useState<number>(5);
    const [postMood, setPostMood] = useState<number>(5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>({
        rain: 0, forest: 0, waves: 0, binaural: 0
    });
    const [error, setError] = useState<string | null>(null);

    // Audio Refs
    const mainAudioRef = useRef<HTMLAudioElement | null>(null);
    const ambientRefs = useRef<Record<string, HTMLAudioElement | null>>({});
    const [currentTrack, setCurrentTrack] = useState(resource);
    const [currentTrackUrl, setCurrentTrackUrl] = useState(MAIN_TRACK_URL);

    // Initialize Ambient Sounds
    useEffect(() => {
        AMBIENT_SOUNDS.forEach(sound => {
            if (!ambientRefs.current[sound.id]) {
                const audio = new Audio(sound.url);
                audio.loop = true;
                audio.volume = 0;
                audio.preload = 'auto';
                audio.onerror = (e) => console.error(`Error loading ambient sound ${sound.id}:`, e);
                ambientRefs.current[sound.id] = audio;
            }
        });

        return () => {
            Object.values(ambientRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        };
    }, []);

    // Handle Play/Pause for Main Track
    useEffect(() => {
        if (mainAudioRef.current) {
            if (isPlaying) {
                const playPromise = mainAudioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error("Playback failed:", e);
                        setIsPlaying(false);
                    });
                }
            } else {
                mainAudioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrackUrl]);

    // Unified Ambient Sound Management
    useEffect(() => {
        Object.entries(ambientRefs.current).forEach(([id, audio]) => {
            if (!audio) return;

            const volume = ambientVolumes[id] || 0;
            audio.volume = volume / 100;

            if (isPlaying && volume > 0) {
                // If it should be playing but isn't, play it
                if (audio.paused) {
                    audio.play().catch(e => console.error(`Failed to play ambient ${id}:`, e));
                }
            } else {
                // If it shouldn't be playing, pause it
                if (!audio.paused) {
                    audio.pause();
                }
            }
        });
    }, [isPlaying, ambientVolumes]);

    const handleTimeUpdate = () => {
        if (mainAudioRef.current) {
            setCurrentTime(mainAudioRef.current.currentTime);
            if (mainAudioRef.current.duration) {
                setProgress((mainAudioRef.current.currentTime / mainAudioRef.current.duration) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (mainAudioRef.current) {
            setDuration(mainAudioRef.current.duration);
            setError(null);
        }
    };

    const handleError = (e: any) => {
        console.error("Audio Error Event:", e);
        setError("Unable to play audio. Please verify the files are correctly downloaded to public/audio/.");
        setIsPlaying(false);
    };

    const handleTrackEnded = () => {
        setIsPlaying(false);
        setSessionState('post-checkin');
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartSession = () => {
        setSessionState('playing');
        setIsPlaying(true);
    };

    const handleEndSession = () => {
        setIsPlaying(false);
        setSessionState('post-checkin');
    };

    const handleFinish = () => {
        setSessionState('summary');
    };

    const handleSeek = (vals: number[]) => {
        const newTime = (vals[0] / 100) * duration;
        if (mainAudioRef.current) {
            mainAudioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            setProgress(vals[0]);
        }
    };

    const handleTrackChange = (track: any) => {
        setIsPlaying(false);
        setCurrentTrack(track);
        setCurrentTrackUrl(track.url);
        setProgress(0);
        setCurrentTime(0);
        setError(null);
        setTimeout(() => setIsPlaying(true), 500);
    };

    const handleNext = () => {
        const currentIndex = RECOMMENDED_TRACKS.findIndex(t => t.id === currentTrack.id);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % RECOMMENDED_TRACKS.length;
        handleTrackChange(RECOMMENDED_TRACKS[nextIndex]);
    };

    const handlePrevious = () => {
        const currentIndex = RECOMMENDED_TRACKS.findIndex(t => t.id === currentTrack.id);
        const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + RECOMMENDED_TRACKS.length) % RECOMMENDED_TRACKS.length;
        handleTrackChange(RECOMMENDED_TRACKS[prevIndex]);
    };

    // --- RENDER: PRE-SESSION CHECK-IN ---
    if (sessionState === 'pre-checkin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
                <div className="max-w-md w-full space-y-12 text-center relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-wellness-calm/20 rounded-full blur-3xl -z-10" />

                    <div className="space-y-4">
                        <Badge variant="outline" className="border-wellness-calm/50 text-wellness-calm px-4 py-1 rounded-full backdrop-blur-sm">
                            Pre-Session Check-in
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            How are you feeling?
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Take a moment to assess your current stress level.
                        </p>
                    </div>

                    <div className="space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="flex justify-between text-sm font-medium text-slate-400 px-2">
                            <span>Stressed</span>
                            <span>Calm</span>
                        </div>
                        <Slider
                            defaultValue={[5]}
                            max={10}
                            step={1}
                            onValueChange={(vals) => setPreMood(vals[0])}
                            className="py-4"
                        />
                        <div className="text-center">
                            <span className="text-6xl font-light text-wellness-calm">{preMood}</span>
                            <span className="text-slate-500 text-xl">/10</span>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStartSession}
                            className="bg-wellness-calm hover:bg-wellness-calm/90 text-white px-8 py-6 rounded-full text-lg shadow-lg shadow-wellness-calm/20 transition-all hover:scale-105"
                        >
                            Begin Session
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: PLAYING SESSION ---
    if (sessionState === 'playing') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
                <audio
                    ref={mainAudioRef}
                    src={currentTrackUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleTrackEnded}
                    onError={handleError}
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-wellness-calm/10 via-slate-950 to-slate-950" />

                <div className="relative z-10 p-6 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-sm">
                    <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Exit
                    </Button>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300 backdrop-blur-sm">
                        Audio Therapy
                    </Badge>
                </div>

                <div className="flex-1 grid lg:grid-cols-3 relative z-10 overflow-hidden">

                    <div className="lg:col-span-2 flex flex-col items-center justify-center p-8 space-y-12 relative">

                        {error && (
                            <Alert variant="destructive" className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md animate-in slide-in-from-top-5">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Playback Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="relative">
                            <div className={`absolute inset-0 bg-wellness-calm/30 rounded-full blur-3xl transition-all duration-[4000ms] ease-in-out
                                ${isPlaying ? 'scale-150 opacity-50' : 'scale-100 opacity-20'}`}
                            />
                            <div className={`w-64 h-64 rounded-full border-2 border-wellness-calm/30 flex items-center justify-center relative backdrop-blur-sm
                                transition-all duration-[4000ms] ease-in-out
                                ${isPlaying ? 'scale-110 border-wellness-calm/50 shadow-[0_0_50px_rgba(56,189,248,0.3)]' : 'scale-100'}`}>
                                <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-wellness-calm to-blue-600 opacity-90 flex items-center justify-center shadow-2xl
                                    transition-all duration-[4000ms] ease-in-out
                                    ${isPlaying ? 'scale-105' : 'scale-95'}`}>
                                    {isPlaying ? (
                                        <Sparkles className="w-12 h-12 text-white/90 animate-pulse" />
                                    ) : (
                                        <Play className="w-12 h-12 text-white/90 ml-2" />
                                    )}
                                </div>
                            </div>
                            <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-wellness-calm/80 font-medium tracking-widest uppercase text-sm whitespace-nowrap">
                                {isPlaying ? 'Breathe In...' : 'Paused'}
                            </p>
                        </div>

                        <div className="w-full max-w-xl space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-semibold text-white">{currentTrack.title || resource.title}</h2>
                                <p className="text-slate-400">{currentTrack.category || 'Guided Relaxation'}</p>
                            </div>

                            <div className="space-y-2 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                                <Slider
                                    value={[progress]}
                                    max={100}
                                    className="cursor-pointer"
                                    onValueChange={handleSeek}
                                />
                                <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-8">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    onClick={handlePrevious}
                                >
                                    <SkipBack className="w-6 h-6" />
                                </Button>

                                <Button
                                    size="icon"
                                    className="w-20 h-20 rounded-full bg-white text-slate-900 hover:bg-wellness-calm hover:text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-white/10"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 fill-current" />
                                    ) : (
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    onClick={handleNext}
                                >
                                    <SkipForward className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 border-l border-white/5 bg-slate-950/30 backdrop-blur-md flex flex-col">
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-8">

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-wellness-calm">
                                        <Volume2 className="w-5 h-5" />
                                        <h3 className="font-semibold tracking-wide uppercase text-sm">Ambient Mixer</h3>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/5">
                                        {AMBIENT_SOUNDS.map((sound) => (
                                            <div key={sound.id} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <sound.icon className="w-4 h-4 text-slate-400" />
                                                        <span>{sound.name}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{ambientVolumes[sound.id]}%</span>
                                                </div>
                                                <Slider
                                                    value={[ambientVolumes[sound.id]]}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={(val) => setAmbientVolumes(prev => ({ ...prev, [sound.id]: val[0] }))}
                                                    className="h-1.5"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-wellness-calm">
                                        <ListMusic className="w-5 h-5" />
                                        <h3 className="font-semibold tracking-wide uppercase text-sm">Recommended</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {RECOMMENDED_TRACKS.map((track) => (
                                            <div
                                                key={track.id}
                                                onClick={() => handleTrackChange(track)}
                                                className={`group flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border border-transparent 
                                                    ${currentTrack.id === track.id ? 'bg-white/10 border-wellness-calm/30' : 'hover:bg-white/5 hover:border-white/5'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                                    ${currentTrack.id === track.id ? 'bg-wellness-calm text-white' : 'bg-slate-900 text-slate-500 group-hover:text-wellness-calm'}`}>
                                                    <Headphones className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-medium truncate ${currentTrack.id === track.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                        {track.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span>{track.category}</span>
                                                        <span>•</span>
                                                        <span>{track.duration}</span>
                                                    </div>
                                                </div>
                                                {currentTrack.id === track.id && isPlaying && (
                                                    <div className="w-2 h-2 rounded-full bg-wellness-calm animate-pulse" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t border-white/5">
                            <Button
                                variant="outline"
                                onClick={handleEndSession}
                                className="w-full border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                            >
                                End Session Early
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: POST-SESSION CHECK-IN ---
    if (sessionState === 'post-checkin') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
                <div className="max-w-md w-full space-y-12 text-center relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10" />

                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            Session Complete
                        </h1>
                        <p className="text-slate-400 text-lg">
                            How are you feeling now?
                        </p>
                    </div>

                    <div className="space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="flex justify-between text-sm font-medium text-slate-400 px-2">
                            <span>Stressed</span>
                            <span>Calm</span>
                        </div>
                        <Slider
                            defaultValue={[5]}
                            max={10}
                            step={1}
                            onValueChange={(vals) => setPostMood(vals[0])}
                            className="py-4"
                        />
                        <div className="text-center">
                            <span className="text-6xl font-light text-green-400">{postMood}</span>
                            <span className="text-slate-500 text-xl">/10</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleFinish}
                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-6 rounded-full text-lg shadow-lg shadow-green-900/20 w-full transition-all hover:scale-105"
                    >
                        See Results
                    </Button>
                </div>
            </div>
        );
    }

    // --- RENDER: SUMMARY ---
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
            <Card className="max-w-md w-full bg-slate-900/50 border-white/10 shadow-2xl backdrop-blur-xl">
                <CardContent className="p-8 space-y-8 text-center">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Great job!</h2>
                        <p className="text-slate-400">You've taken a moment for yourself.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Before</p>
                            <p className="text-3xl font-light text-wellness-calm">{preMood}/10</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">After</p>
                            <p className="text-3xl font-light text-green-400">{postMood}/10</p>
                        </div>
                    </div>

                    <div className="p-4 bg-wellness-calm/10 rounded-xl border border-wellness-calm/20">
                        <p className="text-wellness-calm text-sm">
                            {postMood > preMood
                                ? "Your stress levels have decreased. Keep up the good work!"
                                : "Thank you for checking in. Consistency is key."}
                        </p>
                    </div>

                    <Button onClick={onBack} variant="outline" className="w-full border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                        Return to Resources
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
