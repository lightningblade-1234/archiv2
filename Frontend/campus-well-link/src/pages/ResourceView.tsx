import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft, Clock, Share2, Bookmark, Heart, Headphones, Video, PlayCircle,
    Sparkles, Flower2, Star, Shield, Activity, Brain, Zap, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { ShimmerCard } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { AudioSession } from '@/components/AudioSession';

interface Resource {
    id: string;
    title: string;
    description: string;
    content: string;
    type: string;
    category: string;
    duration: string;
    image_url?: string;
    url?: string;
}

interface ClinicalSymptom {
    id: string;
    slug: string;
    label: string;
    subtext: string;
    icon_name: string;
    color_class: string;
    intervention_title: string;
    intervention_text: string;
    intervention_action: string;
}

interface CBTDistortion {
    id: string;
    slug: string;
    label: string;
    description: string;
    reframe: string;
}

export const ResourceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [resource, setResource] = useState<Resource | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Playlist State
    const [isCollection, setIsCollection] = useState(false);
    const [playlistVideos, setPlaylistVideos] = useState<Resource[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Resource | null>(null);

    // Clinical Triage State
    const [isTriage, setIsTriage] = useState(false);
    const [symptoms, setSymptoms] = useState<ClinicalSymptom[]>([]);
    const [distortions, setDistortions] = useState<CBTDistortion[]>([]);
    const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
    const [selectedDistortion, setSelectedDistortion] = useState<string | null>(null);

    useEffect(() => {
        const fetchResource = async () => {
            if (!id) return;

            try {
                // 1. Fetch the main requested resource
                const { data: mainResource, error } = await supabase
                    .from('resources')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setResource(mainResource);

                // Log activity
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await fetch('/api/activities/log', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                            },
                            body: JSON.stringify({
                                user_id: user.id,
                                activity_type: 'resource',
                                title: `Viewed Resource: ${mainResource.title}`,
                                details: { resource_id: mainResource.id, category: mainResource.category }
                            })
                        });
                    }
                } catch (logError) {
                    console.error('Failed to log activity:', logError);
                }

                // 2. Check for Special Types
                const title = mainResource.title?.trim().toLowerCase();
                if (title?.includes('mindfulness meditation') || mainResource.id === 'c24ce5e3-65d0-4251-a9a3-555b7767328b') {
                    setIsCollection(true);
                    setCurrentVideo(mainResource);
                    const { data: videos, error: videoError } = await supabase
                        .from('resources')
                        .select('*')
                        .eq('type', 'video');
                    if (videoError) throw videoError;
                    setPlaylistVideos(videos || []);
                } else if (mainResource.title === 'Depression Support Workbook') {
                    setIsTriage(true);

                    // Fetch Clinical Data
                    const { data: symptomsData, error: symptomsError } = await supabase
                        .from('clinical_symptoms')
                        .select('*');
                    if (symptomsError) throw symptomsError;
                    setSymptoms(symptomsData || []);

                    const { data: distortionsData, error: distortionsError } = await supabase
                        .from('cbt_distortions')
                        .select('*');
                    if (distortionsError) throw distortionsError;
                    setDistortions(distortionsData || []);
                }

            } catch (error) {
                console.error('Error fetching resource:', error);
                toast({
                    title: "Error",
                    description: "Failed to load the resource. Please try again.",
                    variant: "destructive"
                });
                navigate('/student-dashboard/resources');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResource();
    }, [id, navigate, toast]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copied",
            description: "Resource link copied to clipboard!",
        });
    };

    // Playlist Handlers
    const handleVideoSelect = (video: Resource) => {
        setCurrentVideo(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Clinical Logging Handlers
    const logInteraction = async (type: 'symptom_selected' | 'distortion_selected', slug: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('user_clinical_logs').insert({
                    user_id: user.id,
                    interaction_type: type,
                    item_slug: slug
                });
                console.log(`Logged interaction: ${type} - ${slug}`);
            }
        } catch (error) {
            console.error('Error logging interaction:', error);
        }
    };

    const handleSymptomSelect = (symptom: ClinicalSymptom) => {
        if (selectedSymptom !== symptom.id) {
            setSelectedSymptom(symptom.id);
            logInteraction('symptom_selected', symptom.slug);
        } else {
            setSelectedSymptom(null);
        }
    };

    const handleDistortionSelect = (distortion: CBTDistortion) => {
        if (selectedDistortion !== distortion.id) {
            setSelectedDistortion(distortion.id);
            logInteraction('distortion_selected', distortion.slug);
        } else {
            setSelectedDistortion(null);
        }
    };

    // Helper to map icon string to component
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = { Zap, Activity, Brain, Clock };
        return icons[iconName] || Activity;
    };

    // Helper to get PDF path
    const getPdfPath = (type: 'symptom' | 'distortion', label: string) => {
        const map: Record<string, string> = {
            // Symptoms
            'Agitation': 'Agitation_Information.pdf',
            'Anhedonia': 'Anhedonia_Information.pdf',
            'Brain Fog': 'Brain_Fog_Information.pdf',
            'Insomnia': 'Insomnia.pdf',
            // Distortions
            'All-or-Nothing': 'All-or-Nothing.pdf',
            'Catastrophizing': 'Catastrophizing.pdf',
            'Emotional Reasoning': 'Emotional Reasoning.pdf',
            'Personalization': 'Personalization.pdf'
        };
        return `/pdfs/${map[label] || ''}`;
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="student">
                <div className="max-w-6xl mx-auto space-y-8">
                    <ShimmerCard className="h-96 w-full rounded-3xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!resource) return null;

    // --- AUDIO SESSION LAYOUT ---
    const isAudio = resource.type === 'audio' || resource.title === 'Stress Management Techniques';
    if (isAudio) {
        return <AudioSession resource={resource} onBack={() => navigate('/student-dashboard/resources')} />;
    }

    // --- CLINICAL TRIAGE LAYOUT ---
    if (isTriage) {
        return (
            <DashboardLayout userType="student">
                <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <Button variant="ghost" onClick={() => navigate('/student-dashboard/resources')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Resources
                        </Button>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clinical Support Triage</h1>
                            <p className="text-sm text-muted-foreground">Rapid Assessment & Intervention</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* COLUMN 1: SYMPTOM TRIAGE */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Symptom Triage</h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Select your primary symptom for immediate intervention.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                {symptoms.map((symptom) => {
                                    const Icon = getIconComponent(symptom.icon_name);
                                    return (
                                        <div key={symptom.id} className="relative">
                                            <button
                                                onClick={() => handleSymptomSelect(symptom)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group
                                                    ${selectedSymptom === symptom.id
                                                        ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-md ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700'
                                                        : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${symptom.color_class}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{symptom.label}</h3>
                                                        <p className="text-xs text-slate-500">{symptom.subtext}</p>
                                                    </div>
                                                </div>
                                                {selectedSymptom === symptom.id ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-slate-400" />
                                                )}
                                            </button>

                                            {/* Expanded Intervention Card */}
                                            {selectedSymptom === symptom.id && (
                                                <div className="mt-3 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide mb-1">
                                                                Clinical Intervention: {symptom.intervention_title}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                                                                {symptom.intervention_text}
                                                            </p>
                                                            <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                <strong className="text-slate-900 dark:text-slate-100 text-sm block mb-1">Action:</strong>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {symptom.intervention_action}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-3 w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                onClick={() => window.open(getPdfPath('symptom', symptom.label), '_blank')}
                                                            >
                                                                <Bookmark className="w-4 h-4 mr-2" />
                                                                Read Full Guide
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* COLUMN 2: RAPID CBT */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Rapid CBT</h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Identify a cognitive distortion to see the clinical reframe.
                            </p>

                            <div className="space-y-3">
                                {distortions.map((distortion) => (
                                    <div key={distortion.id} className="group">
                                        <button
                                            onClick={() => handleDistortionSelect(distortion)}
                                            className={`w-full text-left p-4 rounded-lg border transition-all duration-200
                                                ${selectedDistortion === distortion.id
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className={`font-medium ${selectedDistortion === distortion.id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {distortion.label}
                                                </span>
                                                {selectedDistortion === distortion.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                            </div>

                                            {selectedDistortion !== distortion.id && (
                                                <p className="text-xs text-slate-500 mt-1 truncate">{distortion.description}</p>
                                            )}
                                        </button>

                                        {/* Reframe Content */}
                                        {selectedDistortion === distortion.id && (
                                            <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg animate-in fade-in">
                                                <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-2">
                                                    "{distortion.description}"
                                                </p>
                                                <div className="flex gap-3 items-start">
                                                    <Zap className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <strong className="text-sm text-blue-900 dark:text-blue-100 block mb-1">Reframe:</strong>
                                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                                            {distortion.reframe}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-3 w-full hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                                    onClick={() => window.open(getPdfPath('distortion', distortion.label), '_blank')}
                                                >
                                                    <Bookmark className="w-4 h-4 mr-2" />
                                                    Read Full Guide
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // --- VIDEO PLAYLIST LAYOUT ---
    // Debug check - using includes for looser matching
    const title = resource?.title?.trim().toLowerCase();
    const isMindfulness = title?.includes('mindfulness meditation');

    if ((isCollection || isMindfulness) && currentVideo) {
        return (
            <DashboardLayout userType="student">


                <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" onClick={() => navigate('/student-dashboard/resources')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Resources
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={handleShare}>
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bookmark className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Video Player */}
                            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                <iframe
                                    src={currentVideo.url || currentVideo.content} // Fallback to content if url is missing
                                    title={currentVideo.title}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            {/* Video Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-wellness-calm/10 text-wellness-calm hover:bg-wellness-calm/20">
                                        {currentVideo.category}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {currentVideo.duration}
                                    </div>
                                </div>

                                <h1 className="text-3xl font-bold text-foreground">
                                    {currentVideo.title}
                                </h1>

                                <p className="text-muted-foreground leading-relaxed">
                                    {currentVideo.description}
                                </p>
                            </div>

                            {/* Action Card */}
                            <Card className="bg-gradient-to-br from-wellness-calm/5 to-wellness-serene/5 border-wellness-calm/20">
                                <CardContent className="p-6 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-1">Need more support?</h3>
                                        <p className="text-sm text-muted-foreground">Try our guided breathing exercises.</p>
                                    </div>
                                    <Button onClick={() => navigate('/self-care-hub')}>
                                        Start Breathing
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Playlist Sidebar */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Course Content</h2>
                                <Badge variant="outline">{playlistVideos.length} Videos</Badge>
                            </div>

                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-3">
                                    {playlistVideos.map((video, index) => (
                                        <div
                                            key={video.id}
                                            onClick={() => handleVideoSelect(video)}
                                            className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 flex gap-3 border
                                                ${currentVideo.id === video.id
                                                    ? 'bg-wellness-calm/10 border-wellness-calm/30 shadow-sm'
                                                    : 'bg-card hover:bg-accent/50 border-transparent hover:border-border'
                                                }`}
                                        >
                                            {/* Thumbnail / Number */}
                                            <div className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center
                                                ${currentVideo.id === video.id ? 'bg-wellness-calm/20' : 'bg-muted'}`}>
                                                {video.image_url ? (
                                                    <img src={video.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <PlayCircle className={`w-6 h-6 ${currentVideo.id === video.id ? 'text-wellness-calm' : 'text-muted-foreground'}`} />
                                                )}
                                                {currentVideo.id === video.id && (
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-medium text-sm leading-tight mb-1 line-clamp-2
                                                    ${currentVideo.id === video.id ? 'text-wellness-calm' : 'text-foreground'}`}>
                                                    {index + 1}. {video.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{video.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // --- STANDARD ARTICLE LAYOUT ---
    return (
        <DashboardLayout userType="student">
            <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 backdrop-blur-md p-4 rounded-b-xl mb-6 border-b border-border/50">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/student-dashboard/resources')}
                        className="hover:bg-white/20"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Bookmark className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative h-80 rounded-3xl overflow-hidden mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    <img
                        src={resource.image_url || "https://images.unsplash.com/photo-1518531933037-9a82bf55f363?auto=format&fit=crop&q=80"}
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                {resource.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-white/80 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Clock className="w-3 h-3" />
                                {resource.duration}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
                            {resource.title}
                        </h1>
                    </div>
                </div>

                {/* Content Body */}
                <Card className="glass-card border-0 mb-12">
                    <CardContent className="p-8 md:p-12">
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none
                                prose-headings:font-bold prose-headings:text-foreground
                                prose-p:text-muted-foreground prose-p:leading-relaxed
                                prose-li:text-muted-foreground
                                prose-strong:text-foreground prose-strong:font-semibold
                                prose-a:text-wellness-calm hover:prose-a:text-wellness-serene"
                            dangerouslySetInnerHTML={{ __html: resource.content || resource.description }}
                        />
                    </CardContent>
                </Card>

                {/* Call to Action (Shared) */}
                <Card className="bg-gradient-to-br from-wellness-calm/10 to-wellness-serene/10 border-0 overflow-hidden relative mt-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-wellness-calm/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <Heart className="w-6 h-6 text-wellness-warm" />
                                Feeling overwhelmed?
                            </h3>
                            <p className="text-muted-foreground">
                                Take a moment to breathe and center yourself with our guided exercises.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-wellness-calm hover:bg-wellness-calm/90 text-white shadow-lg hover:shadow-xl transition-all"
                            onClick={() => navigate('/self-care-hub')}
                        >
                            Start Breathing Exercise
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};
