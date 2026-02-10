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

interface ValuationDetailsClientProps {
  id: string;
  dictionary: any;
}

export default function ValuationDetailsClient({ id, dictionary }: ValuationDetailsClientProps) {
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
          .eq('valuation_id', id)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: dictionary.notFound.title,
            description: dictionary.notFound.description,
            variant: "destructive",
          });
          router.push('/valuations');
          return;
        }

        setValuation(data);
      } catch (error) {
        console.error('Error fetching valuation:', error);
        toast({
          title: dictionary.error.title,
          description: dictionary.error.description,
          variant: "destructive",
        });
        router.push('/valuations');
      } finally {
        setLoading(false);
      }
    }

    checkSessionAndFetchValuation();
  }, [id, router, supabase, toast, dictionary]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>{dictionary.loading}</p>
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
          <p className="text-muted-foreground">{dictionary.appraisedOn} {createdAt}</p>
        </div>
        <Button variant="outline" asChild className="mt-4 md:mt-0">
          <Link href="/my-valuations">{dictionary.backButton}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.detailedAnalysis}</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailedAnalysis analysis={report} dictionary={dictionary} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.valuationSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{dictionary.estimatedValue}</h3>
                  <p className="text-2xl font-bold">{estimatedValue}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-lg">{dictionary.valuationType}</h3>
                  <p>{valuation.is_detailed ? dictionary.detailed : dictionary.standard}</p>
                </div>
                
                {audioSummary && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{dictionary.audioSummary}</h3>
                      <AudioPlayer audioUrl={audioSummary} />
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="pt-2">
                  <Button className="w-full">
                    {dictionary.requestRefinement}
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
