'use client';

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import AppraiseAntique from "@/components/appraise-antique";

export default function AppraisePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/appraise');
      }
    }
    
    checkSession();
  }, [router, supabase]);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Appraise Your Antique</h1>
      <AppraiseAntique />
    </div>
  );
} 