'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import DetailedAnalysis from '@/components/detailed-analysis';
import AudioPlayer from '@/components/audio-player';
import Link from 'next/link';

interface ValuationPageProps {
  params: {
    id: string;
  };
}

export default function ValuationPage({ params }: ValuationPageProps) {
  const [valuation, setValuation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkSessionAndFetchValuation() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('valuations')
          .select('*')
          .eq('valuation_id', params.id)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: "Valuation not found",
            description: "This valuation doesn't exist or you don't have permission to view it.",
            variant: "destructive",
          });
          router.push('/valuations');
          return;
        }

        setValuation(data);
      } catch (error) {
        console.error('Error fetching valuation:', error);
        toast({
          title: "Error",
          description: "Failed to load this valuation. Please try again.",
          variant: "destructive",
        });
        router.push('/valuations');
      } finally {
        setLoading(false);
      }
    }

    checkSessionAndFetchValuation();
  }, [params.id, router, supabase, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading valuation details...</p>
      </div>
    );
  }

  if (!valuation) {
    return null;
  }

  const report = valuation.valuation_report;
  const audioSummary = report?.audioSummary;
  const title = report?.attribution?.title || "Unnamed Item";
  const estimatedValue = report?.valueIndicators?.estimatedValue || "Not available";
  const createdAt = formatDate(valuation.created_at) || "Unknown date";

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Appraised on {createdAt}</p>
        </div>
        <Button variant="outline" asChild className="mt-4 md:mt-0">
          <Link href="/valuations">Back to My Valuations</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailedAnalysis analysisData={report} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valuation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Estimated Value</h3>
                  <p className="text-2xl font-bold">{estimatedValue}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-lg">Valuation Type</h3>
                  <p>{valuation.is_detailed ? "Detailed Analysis" : "Standard Analysis"}</p>
                </div>
                
                {audioSummary && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Audio Summary</h3>
                      <AudioPlayer audioUrl={audioSummary} />
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="pt-2">
                  <Button className="w-full">
                    Request Expert Refinement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 