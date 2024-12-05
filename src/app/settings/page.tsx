'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { toast } from '@/components/ui/use-toast';

const preferencesSchema = z.object({
  style: z.enum(['academic', 'casual', 'business']),
  detailLevel: z.number().min(1).max(5),
  focusAreas: z.array(z.enum(['main_points', 'examples', 'implications', 'citations'])).min(1),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function SettingsPage() {
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
  });

  useEffect(() => {
    // Fetch current preferences
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences');
        const data = await response.json();
        form.reset(data);
      } catch (error) {
        console.error('Fetch preferences error:', error);
      }
    }

    fetchPreferences();
  }, [form]);

  async function onSubmit(data: PreferencesFormValues) {
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      toast({
        title: 'Preferences Updated',
        description: 'Your learning preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Preferences update error:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Learning Preferences</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary Style</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="academic" id="academic" />
                        <label htmlFor="academic">Academic</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="casual" id="casual" />
                        <label htmlFor="casual">Casual</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" />
                        <label htmlFor="business">Business</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="detailLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
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

            <FormField
              control={form.control}
              name="focusAreas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Focus Areas</FormLabel>
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

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
} 