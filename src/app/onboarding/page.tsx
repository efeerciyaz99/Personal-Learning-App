'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelect } from '@/components/ui/multi-select';

const preferencesSchema = z.object({
  style: z.enum(['academic', 'casual', 'business']),
  detailLevel: z.number().min(1).max(5),
  focusAreas: z.array(z.enum(['main_points', 'examples', 'implications', 'citations'])).min(1),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      style: 'casual',
      detailLevel: 3,
      focusAreas: ['main_points'],
    },
  });

  async function onSubmit(data: PreferencesFormValues) {
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      router.push('/dashboard');
    } catch (error) {
      console.error('Preferences save error:', error);
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome! Let's personalize your experience</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How would you like your summaries to be written?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="academic" id="academic" />
                          <label htmlFor="academic">Academic (formal, structured)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="casual" id="casual" />
                          <label htmlFor="casual">Casual (conversational, easy to read)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="business" id="business" />
                          <label htmlFor="business">Business (professional, concise)</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <FormField
                control={form.control}
                name="detailLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How detailed would you like your summaries?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                        className="grid grid-cols-1 gap-4"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level.toString()} id={`level-${level}`} />
                            <label htmlFor={`level-${level}`}>
                              Level {level} {level === 1 ? '(Brief)' : level === 5 ? '(Very Detailed)' : ''}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 3 && (
              <FormField
                control={form.control}
                name="focusAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What aspects should the summaries focus on?</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={[
                          { label: 'Main Points', value: 'main_points' },
                          { label: 'Examples', value: 'examples' },
                          { label: 'Implications', value: 'implications' },
                          { label: 'Citations', value: 'citations' },
                        ]}
                        selected={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Complete Setup</Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
} 