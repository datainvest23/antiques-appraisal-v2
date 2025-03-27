'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Valuation {
  valuation_id: string;
  created_at: string;
  is_detailed: boolean;
  valuation_report: any;
}

export default function MyValuations() {
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      fetchValuations(session.user.id);
    }

    checkSession();
  }, [router, supabase]);

  async function fetchValuations(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setValuations(data || []);
    } catch (error) {
      console.error('Error fetching valuations:', error);
      toast({
        title: "Error",
        description: "Failed to load your valuations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getValueEstimate(valuation: Valuation) {
    const report = valuation.valuation_report;
    if (!report || !report.valueIndicators || !report.valueIndicators.estimatedValue) {
      return "Not available";
    }
    return report.valueIndicators.estimatedValue;
  }

  function getItemName(valuation: Valuation) {
    const report = valuation.valuation_report;
    if (!report || !report.attribution || !report.attribution.title) {
      return "Unnamed Item";
    }
    return report.attribution.title;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Valuations</h1>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading your valuations...</p>
        </div>
      ) : valuations.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-4">No valuations yet</h2>
          <p className="mb-6">Get started by appraising your first antique</p>
          <Button asChild>
            <Link href="/appraise">Appraise an Antique</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valuations.map((valuation) => (
            <Card key={valuation.valuation_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{getItemName(valuation)}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(valuation.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Estimated Value:</span> {getValueEstimate(valuation)}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span> {valuation.is_detailed ? "Detailed" : "Standard"}
                  </div>
                  <Separator className="my-4" />
                  <Button asChild className="w-full">
                    <Link href={`/valuation/${valuation.valuation_id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 