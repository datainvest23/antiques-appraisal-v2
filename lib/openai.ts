import OpenAI from "openai";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read the designated assistant ID from environment variables
const assistantId = process.env.OPENAI_ASSISTANT_ID;

if (!assistantId) {
  throw new Error("OPENAI_ASSISTANT_ID is not set in environment variables");
}

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to validate the assistant's response
function validateAssistantResponse(result: any): boolean {
  const requiredFields = [
    'introduction',
    'full_report',
    'identification',
    'physical_attributes',
    'inscriptions_marks_labels',
    'distinguishing_features',
    'stylistic_assessment',
    'provenance_and_attribution',
    'value_indicators',
    'recommendations'
  ];

  return requiredFields.every(field => {
    const hasField = field in result;
    if (!hasField) {
      console.error(`Missing required field: ${field}`);
    }
    return hasField;
  });
}

// Helper function to clean up resources
async function cleanupThread(threadId: string) {
  try {
    await openai.beta.threads.del(threadId);
  } catch (error) {
    console.error(`Failed to delete thread ${threadId}:`, error);
  }
}

// Helper function to retry API calls
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        continue;
      }
    }
  }
  
  throw lastError || new Error('Operation failed after all retries');
}

export interface AntiqueAnalysisResult {
  preliminaryCategory: string;
  physicalAttributes: {
    materials: string;
    measurements: string;
    condition: string;
  };
  inscriptions: {
    signatures: string;
    hallmarks: string;
    additionalIdentifiers: string;
  };
  uniqueFeatures: {
    motifs: string;
    restoration: string;
    anomalies: string;
  };
  stylistic: {
    indicators: string;
    estimatedEra: string;
    confidenceLevel: string;
  };
  attribution: {
    likelyMaker: string;
    evidence: string;
    probability: string;
  };
  provenance: {
    infoInPhotos: string;
    historicIndicators: string;
    recommendedFollowup: string;
  };
  intake: {
    photoCount: string;
    photoQuality: string;
    lightingAngles: string;
    overallImpression: string;
  };
  valueIndicators: {
    factors: string;
    redFlags: string;
    references: string;
    followupQuestions: string[];
  };
  summary: string;
  fullReport: string;
}

/**
 * Sends a request to the dedicated assistant to generate an antique appraisal report.
 * Since your assistant is pre-configured with instructions and schema,
 * we only need to send a concise user message.
 */
export async function analyzeAntique(
  imageUrls: string[],
  additionalInfo?: string
): Promise<AntiqueAnalysisResult> {
  let threadId: string | null = null;
  
  try {
    // Limit to a maximum of 3 images
    const limitedUrls = imageUrls.slice(0, 3);
    console.log(`Processing ${limitedUrls.length} images for analysis`);

    // Validate image URLs
    if (!limitedUrls.every(url => url.startsWith('http'))) {
      throw new Error('Invalid image URLs provided');
    }

    // Prepare message content
    const messageContent = [
      {
        type: "text" as const,
        text: `Analyze these images of an antique item.${additionalInfo ? ` Additional information: ${additionalInfo}` : ""}`,
      },
      ...limitedUrls.map((url) => ({
        type: "image_url" as const,
        image_url: { url },
      })),
    ];

    // Create a thread with retry
    const thread = await withRetry(() => openai.beta.threads.create());
    threadId = thread.id;

    // Add a message to the thread with retry
    await withRetry(() => 
      openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: messageContent,
        }
      )
    );

    // Run the assistant on the thread with retry
    const run = await withRetry(() =>
      openai.beta.threads.runs.create(
        thread.id,
        {
          assistant_id: assistantId,
        }
      )
    );

    // Wait for the run to complete with timeout
    let runStatus = await withRetry(() => 
      openai.beta.threads.runs.retrieve(thread.id, run.id)
    );

    // Poll for completion (with timeout)
    const startTime = Date.now();
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      // Check for timeout (60 seconds)
      if (Date.now() - startTime > 60000) {
        throw new Error("OpenAI API timeout after 60 seconds");
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check status with retry
      runStatus = await withRetry(() => 
        openai.beta.threads.runs.retrieve(thread.id, run.id)
      );
      
      if (runStatus.status === "failed") {
        throw new Error("Assistant run failed: " + (runStatus.last_error?.message || "Unknown error"));
      }
    }

    // Retrieve the messages from the thread with retry
    const messages = await withRetry(() => 
      openai.beta.threads.messages.list(thread.id)
    );
    
    // Get the last assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    if (assistantMessages.length === 0) {
      throw new Error("No response from assistant");
    }
    
    // Parse the JSON content from the last assistant message
    const lastMessage = assistantMessages[0];
    const jsonContent = lastMessage.content.find(
      content => content.type === "text"
    );
    
    if (!jsonContent || !jsonContent.text) {
      throw new Error("Assistant response did not contain text content");
    }
    
    // Parse the JSON response
    let result;
    try {
      // First parse the outer JSON object
      const outerJson = JSON.parse(jsonContent.text);
      
      // Extract the inner JSON string from the value property
      if (outerJson.value) {
        result = JSON.parse(outerJson.value);
      } else {
        result = outerJson;
      }

      // Validate the response structure
      if (!validateAssistantResponse(result)) {
        throw new Error("Assistant response missing required fields");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw response:", jsonContent.text);
      throw new Error("Failed to parse the analysis response");
    }

    // Transform the assistant's response into our expected format
    return {
      preliminaryCategory: result.introduction?.category || "",
      physicalAttributes: {
        materials: result.physical_attributes?.materials_techniques || "",
        measurements: result.physical_attributes?.measurements || "",
        condition: result.physical_attributes?.condition || "",
      },
      inscriptions: {
        signatures: result.inscriptions_marks_labels?.markings || "",
        hallmarks: result.inscriptions_marks_labels?.interpretation || "",
        additionalIdentifiers: "",
      },
      uniqueFeatures: {
        motifs: result.distinguishing_features?.motifs_decorations || "",
        restoration: result.distinguishing_features?.alterations || "",
        anomalies: "",
      },
      stylistic: {
        indicators: result.stylistic_assessment?.style_indicators || "",
        estimatedEra: result.stylistic_assessment?.estimated_era || "",
        confidenceLevel: result.stylistic_assessment?.confidence || "",
      },
      attribution: {
        likelyMaker: result.provenance_and_attribution?.possible_maker || "",
        evidence: result.provenance_and_attribution?.rationale || "",
        probability: "",
      },
      provenance: {
        infoInPhotos: result.identification?.photos || "",
        historicIndicators: result.provenance_and_attribution?.hints_of_origin || "",
        recommendedFollowup: result.recommendations?.next_steps || "",
      },
      intake: {
        photoCount: result.identification?.photos || "",
        photoQuality: "",
        lightingAngles: "",
        overallImpression: result.identification?.impression || "",
      },
      valueIndicators: {
        factors: result.value_indicators?.factors || "",
        redFlags: result.value_indicators?.concerns || "",
        references: "",
        followupQuestions: [],
      },
      summary: result.full_report?.description || "",
      fullReport: JSON.stringify(result, null, 2),
    };
  } catch (error: unknown) {
    console.error("Error analyzing antique:", error);
    if (error instanceof Error) {
      if (error.message?.includes("timeout")) {
        throw new Error(
          "Analysis timed out. Please try with fewer or smaller images."
        );
      }
      throw new Error(
        `Failed to analyze the antique: ${error.message}`
      );
    }
    throw new Error(
      "Failed to analyze the antique. Please try again with clearer images."
    );
  } finally {
    // Clean up the thread
    if (threadId) {
      await cleanupThread(threadId);
    }
  }
}

/**
 * Refines an initial analysis report based on user feedback.
 */
export async function refineAnalysis(
  initialAnalysis: AntiqueAnalysisResult,
  userFeedback: string
): Promise<AntiqueAnalysisResult> {
  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add initial analysis as an assistant message
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "assistant",
        content: JSON.stringify(initialAnalysis),
      }
    );

    // Add user feedback
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: `Refine your analysis using this additional information: ${userFeedback}`,
      }
    );

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(
      thread.id,
      {
        assistant_id: assistantId,
      }
    );

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id, 
      run.id
    );

    // Poll for completion (with timeout)
    const startTime = Date.now();
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      // Check for timeout (60 seconds)
      if (Date.now() - startTime > 60000) {
        throw new Error("OpenAI API timeout after 60 seconds");
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check status
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id, 
        run.id
      );
      
      if (runStatus.status === "failed") {
        throw new Error("Assistant run failed: " + (runStatus.last_error?.message || "Unknown error"));
      }
    }

    // Retrieve the messages from the thread
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Get the last assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    if (assistantMessages.length === 0 || assistantMessages.length === 1) {
      throw new Error("No new response from assistant");
    }
    
    // Parse the JSON content from the last assistant message (should be the newest one)
    const lastMessage = assistantMessages[0];
    const jsonContent = lastMessage.content.find(
      content => content.type === "text"
    );
    
    if (!jsonContent || !jsonContent.text) {
      throw new Error("Assistant response did not contain text content");
    }
    
    // Parse the JSON response
    let result;
    try {
      // First parse the outer JSON object
      const outerJson = JSON.parse(jsonContent.text);
      
      // Extract the inner JSON string from the value property
      if (outerJson.value) {
        result = JSON.parse(outerJson.value);
      } else {
        result = outerJson;
      }

      // Validate the response structure
      if (!validateAssistantResponse(result)) {
        throw new Error("Assistant response missing required fields");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw response:", jsonContent.text);
      throw new Error("Failed to parse the refined analysis response");
    }

    return {
      preliminaryCategory:
        result.preliminaryCategory || initialAnalysis.preliminaryCategory,
      physicalAttributes: {
        materials:
          result.physical_attributes?.materials ||
          initialAnalysis.physicalAttributes.materials,
        measurements:
          result.physical_attributes?.measurements ||
          initialAnalysis.physicalAttributes.measurements,
        condition:
          result.physical_attributes?.condition ||
          initialAnalysis.physicalAttributes.condition,
      },
      inscriptions: {
        signatures:
          result.inscriptions?.signatures ||
          initialAnalysis.inscriptions.signatures,
        hallmarks:
          result.inscriptions?.hallmarks ||
          initialAnalysis.inscriptions.hallmarks,
        additionalIdentifiers:
          result.inscriptions?.additionalIdentifiers ||
          initialAnalysis.inscriptions.additionalIdentifiers,
      },
      uniqueFeatures: {
        motifs:
          result.uniqueFeatures?.motifs ||
          initialAnalysis.uniqueFeatures.motifs,
        restoration:
          result.uniqueFeatures?.restoration ||
          initialAnalysis.uniqueFeatures.restoration,
        anomalies:
          result.uniqueFeatures?.anomalies ||
          initialAnalysis.uniqueFeatures.anomalies,
      },
      stylistic: {
        indicators:
          result.stylistic?.indicators ||
          initialAnalysis.stylistic.indicators,
        estimatedEra:
          result.stylistic?.estimatedEra ||
          initialAnalysis.stylistic.estimatedEra,
        confidenceLevel:
          result.stylistic?.confidenceLevel ||
          initialAnalysis.stylistic.confidenceLevel,
      },
      attribution: {
        likelyMaker:
          result.attribution?.likelyMaker ||
          initialAnalysis.attribution.likelyMaker,
        evidence:
          result.attribution?.evidence ||
          initialAnalysis.attribution.evidence,
        probability:
          result.attribution?.probability ||
          initialAnalysis.attribution.probability,
      },
      provenance: {
        infoInPhotos:
          result.provenance?.infoInPhotos ||
          initialAnalysis.provenance.infoInPhotos,
        historicIndicators:
          result.provenance?.historicIndicators ||
          initialAnalysis.provenance.historicIndicators,
        recommendedFollowup:
          result.provenance?.recommendedFollowup ||
          initialAnalysis.provenance.recommendedFollowup,
      },
      intake: {
        photoCount:
          result.intake?.photoCount ||
          initialAnalysis.intake.photoCount,
        photoQuality:
          result.intake?.photoQuality ||
          initialAnalysis.intake.photoQuality,
        lightingAngles:
          result.intake?.lightingAngles ||
          initialAnalysis.intake.lightingAngles,
        overallImpression:
          result.intake?.overallImpression ||
          initialAnalysis.intake.overallImpression,
      },
      valueIndicators: {
        factors:
          result.valueIndicators?.factors ||
          initialAnalysis.valueIndicators.factors,
        redFlags:
          result.valueIndicators?.redFlags ||
          initialAnalysis.valueIndicators.redFlags,
        references:
          result.valueIndicators?.references ||
          initialAnalysis.valueIndicators.references,
        followupQuestions:
          result.valueIndicators?.followupQuestions ||
          initialAnalysis.valueIndicators.followupQuestions,
      },
      summary: result.summary || initialAnalysis.summary,
      fullReport: result.fullReport || initialAnalysis.fullReport,
    };
  } catch (error) {
    console.error("Error refining analysis:", error);
    throw new Error("Failed to refine the analysis. Please try again.");
  }
}

export async function generateAudioSummary(text: string): Promise<string> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Get the audio data (simulate saving and returning a URL)
    await response.arrayBuffer();
    return "/api/audio/summary.mp3";
  } catch (error) {
    console.error("Error generating audio summary:", error);
    throw new Error("Failed to generate audio summary. Please try again.");
  }
}
