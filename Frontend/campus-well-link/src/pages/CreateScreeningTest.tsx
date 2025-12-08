import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['mcq', 'likert', 'yesno']),
  options: z.array(z.object({
    text: z.string(),
    score: z.number()
  })).optional(),
  defaultScore: z.number().optional()
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  riskCalculationMethod: z.string().min(1, 'Please select a calculation method'),
  questions: z.array(questionSchema).min(1, 'At least one question is required')
});

type FormValues = z.infer<typeof formSchema>;

type Question = z.infer<typeof questionSchema>;

export const CreateScreeningTest = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      riskCalculationMethod: '',
      questions: []
    }
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'mcq',
      options: [
        { text: '', score: 0 },
        { text: '', score: 1 }
      ]
    };
    setQuestions([...questions, newQuestion]);
    form.setValue('questions', [...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    form.setValue('questions', updated);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    const updated = questions.map(q => {
      if (q.id === id) {
        if (field === 'type') {
          // Reset options based on type
          if (value === 'likert') {
            return { ...q, [field]: value, options: [
              { text: 'Not at all', score: 0 },
              { text: 'Several days', score: 1 },
              { text: 'More than half the days', score: 2 },
              { text: 'Nearly every day', score: 3 }
            ]};
          } else if (value === 'yesno') {
            return { ...q, [field]: value, options: [
              { text: 'No', score: 0 },
              { text: 'Yes', score: 1 }
            ]};
          } else {
            return { ...q, [field]: value, options: [
              { text: '', score: 0 },
              { text: '', score: 1 }
            ]};
          }
        }
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuestions(updated);
    form.setValue('questions', updated);
  };

  const addOption = (questionId: string) => {
    const updated = questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: [...q.options, { text: '', score: q.options.length }]
        };
      }
      return q;
    });
    setQuestions(updated);
    form.setValue('questions', updated);
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const updated = questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optionIndex)
        };
      }
      return q;
    });
    setQuestions(updated);
    form.setValue('questions', updated);
  };

  const updateOption = (questionId: string, optionIndex: number, field: 'text' | 'score', value: string | number) => {
    const updated = questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.map((opt, i) => 
            i === optionIndex ? { ...opt, [field]: value } : opt
          )
        };
      }
      return q;
    });
    setQuestions(updated);
    form.setValue('questions', updated);
  };

  const onSubmit = (data: FormValues) => {
    console.log('Test Data:', data);
    toast.success('Screening test created successfully!');
    navigate('/admin-dashboard/screening');
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin-dashboard/screening')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Screening Test</h1>
              <p className="text-muted-foreground mt-2">
                Design a custom mental health assessment
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
                <CardDescription>Basic details about the screening test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PHQ-9 Depression Screening" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this assessment measures and its purpose..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="depression">Depression</SelectItem>
                            <SelectItem value="anxiety">Anxiety</SelectItem>
                            <SelectItem value="stress">Stress</SelectItem>
                            <SelectItem value="sleep">Sleep</SelectItem>
                            <SelectItem value="burnout">Burnout</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskCalculationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Calculation Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="score-based">Score-Based</SelectItem>
                            <SelectItem value="average-based">Average-Based</SelectItem>
                            <SelectItem value="custom-rules">Custom Rules</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions Builder */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Build your assessment questions</CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions added yet. Click "Add Question" to start building your test.
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <Card key={question.id} className="border-2 border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Question Text</Label>
                          <Input
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            placeholder="Enter your question..."
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Question Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => updateQuestion(question.id, 'type', value)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">Multiple Choice</SelectItem>
                              <SelectItem value="likert">Likert Scale (1-5)</SelectItem>
                              <SelectItem value="yesno">Yes/No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Options */}
                        {question.options && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Options & Scoring</Label>
                              {question.type === 'mcq' && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(question.id)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Option
                                </Button>
                              )}
                            </div>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex gap-2 items-center">
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateOption(question.id, optIndex, 'text', e.target.value)}
                                  placeholder="Option text"
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={option.score}
                                  onChange={(e) => updateOption(question.id, optIndex, 'score', parseInt(e.target.value))}
                                  placeholder="Score"
                                  className="w-20"
                                />
                                {question.type === 'mcq' && question.options && question.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(question.id, optIndex)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin-dashboard/screening')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Test
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};
