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
  introduction?: {
    title?: string;
  };
  physicalAttributes: {
    materials: string;
    measurements: string;
    condition: string;
    priority?: string;
    status?: string;
  };
  inscriptions: {
    signatures: string;
    hallmarks: string;
    additionalIdentifiers: string;
    priority?: string;
    status?: string;
  };
  uniqueFeatures: {
    motifs: string;
    restoration: string;
    anomalies: string;
    priority?: string;
    status?: string;
  };
  stylistic: {
    indicators: string;
    estimatedEra: string;
    confidenceLevel: string;
    priority?: string;
    status?: string;
  };
  attribution: {
    likelyMaker: string;
    evidence: string;
    probability: string;
    priority?: string;
    status?: string;
  };
  provenance: {
    infoInPhotos: string;
    historicIndicators: string;
    recommendedFollowup: string;
    priority?: string;
    status?: string;
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
    priority?: string;
    status?: string;
  };
  summary: string;
  fullReport: {
    description?: string;
    historical_context?: string;
    condition_and_authenticity?: string;
    use?: string;
    value?: string;
    next_steps?: string;
  } | string;
}

function parseAssistantResponse(text: any): any {
  console.log("Raw input to parseAssistantResponse:", text);
  
  // If text is already an object with a value property
  if (typeof text === 'object' && text !== null && 'value' in text) {
    try {
      // For cases where the value might be a template literal string surrounded by backticks
      let valueStr = text.value;
      
      // Check if valueStr is surrounded by backticks and remove them
      if (typeof valueStr === 'string') {
        valueStr = valueStr.replace(/^`|`$/g, '');
      }
      
      const parsed = JSON.parse(valueStr);
      console.log("Successfully parsed object.value:", parsed);
      return parsed;
    } catch (error) {
      console.error("Failed to parse object.value:", error);
    }
  }

  // If text is a string, try the existing parsing methods
  if (typeof text === 'string') {
    // First try to parse the entire text as JSON
    try {
      const parsed = JSON.parse(text);
      console.log("Successfully parsed direct JSON:", parsed);
      return parsed;
    } catch {
      console.log("Direct JSON parsing failed, trying alternative methods");
    }

    // Try to extract JSON from the value property
    try {
      const valueMatch = text.match(/"value"\s*:\s*"([^"]+)"/);
      if (valueMatch) {
        const valueStr = valueMatch[1].replace(/\\"/g, '"').replace(/^`|`$/g, '');
        const parsed = JSON.parse(valueStr);
        console.log("Successfully parsed value property:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("Failed to parse value property:", error);
    }

    // Try to extract JSON from backticks
    try {
      const backtickMatch = text.match(/`(\{[\s\S]*\})`/);
      if (backtickMatch) {
        const parsed = JSON.parse(backtickMatch[1]);
        console.log("Successfully parsed backtick-wrapped JSON:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("Failed to parse backtick-wrapped JSON:", error);
    }

    // Try to extract any JSON object
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed raw JSON:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("Failed to parse raw JSON:", error);
    }
  }

  console.error("No valid JSON found in response. Raw input:", text);
  throw new Error('No valid JSON found in response');
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
    console.log("Analyzing antique with limited images:", limitedUrls);

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
          assistant_id: assistantId as string,
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
    
    // Debug logging
    console.log("jsonContent.text type:", typeof jsonContent.text);
    console.log("jsonContent.text structure:", JSON.stringify(jsonContent.text, null, 2));
    
    // Parse and validate the response
    try {
      const result = parseAssistantResponse(jsonContent.text);
      
      // Log the parsed result for debugging
      console.log("Parsed analysis result:", JSON.stringify(result, null, 2));
      
      // Transform the response to match our expected format
      return {
        preliminaryCategory: result.introduction?.category || "Unknown",
        introduction: {
          title: result.introduction?.title || "",
        },
        physicalAttributes: {
          materials: result.physical_attributes?.materials_techniques || "",
          measurements: result.physical_attributes?.measurements || "",
          condition: result.physical_attributes?.condition || "",
          priority: result.physical_attributes?.priority || "",
          status: result.physical_attributes?.status || ""
        },
        inscriptions: {
          signatures: result.inscriptions_marks_labels?.markings || "",
          hallmarks: result.inscriptions_marks_labels?.interpretation || "",
          additionalIdentifiers: "",
          priority: result.inscriptions_marks_labels?.priority || "",
          status: result.inscriptions_marks_labels?.status || ""
        },
        uniqueFeatures: {
          motifs: result.distinguishing_features?.motifs_decorations || "",
          restoration: result.distinguishing_features?.alterations || "",
          anomalies: "",
          priority: result.distinguishing_features?.priority || "",
          status: result.distinguishing_features?.status || ""
        },
        stylistic: {
          indicators: result.stylistic_assessment?.style_indicators || "",
          estimatedEra: result.stylistic_assessment?.estimated_era || "",
          confidenceLevel: result.stylistic_assessment?.confidence || "",
          priority: result.stylistic_assessment?.priority || "",
          status: result.stylistic_assessment?.status || ""
        },
        attribution: {
          likelyMaker: result.provenance_and_attribution?.possible_maker || "",
          evidence: result.provenance_and_attribution?.rationale || "",
          probability: result.provenance_and_attribution?.attribution_priority || "",
          priority: result.provenance_and_attribution?.attribution_priority || "",
          status: result.provenance_and_attribution?.attribution_status || ""
        },
        provenance: {
          infoInPhotos: result.provenance_and_attribution?.hints_of_origin || "",
          historicIndicators: "",
          recommendedFollowup: result.recommendations?.next_steps || "",
          priority: result.provenance_and_attribution?.provenance_priority || "",
          status: result.provenance_and_attribution?.provenance_status || ""
        },
        intake: {
          photoCount: result.identification?.photos || "",
          photoQuality: "",
          lightingAngles: "",
          overallImpression: result.identification?.impression || ""
        },
        valueIndicators: {
          factors: result.value_indicators?.factors || "",
          redFlags: result.value_indicators?.concerns || "",
          references: "",
          followupQuestions: [],
          priority: result.value_indicators?.priority || "",
          status: result.value_indicators?.status || ""
        },
        summary: result.full_report?.description || "",
        fullReport: result.full_report || ""
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error parsing JSON response:", errorMessage);
      console.error("Raw response:", jsonContent.text);
      throw new Error(`Failed to parse the analysis response: ${errorMessage}`);
    }
  } catch (error) {
    // Clean up the thread if it was created
    if (threadId) {
      await cleanupThread(threadId);
    }
    
    console.error("Error analyzing antique:", error);
    throw new Error(
      `Failed to analyze the antique: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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
        assistant_id: assistantId as string,
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
    
    let result;
    try {
      result = parseAssistantResponse(jsonContent.text);

      // Validate the response structure
      if (!validateAssistantResponse(result)) {
        throw new Error("Assistant response missing required fields");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error parsing JSON response:", errorMessage);
      console.error("Raw response:", jsonContent.text);
      throw new Error(`Failed to parse the refined analysis response: ${errorMessage}`);
    }

    return {
      preliminaryCategory: result.introduction?.category || initialAnalysis.preliminaryCategory,
      introduction: {
        title: result.introduction?.title || initialAnalysis.introduction?.title || "",
      },
      physicalAttributes: {
        materials: result.physical_attributes?.materials_techniques || initialAnalysis.physicalAttributes.materials,
        measurements: result.physical_attributes?.measurements || initialAnalysis.physicalAttributes.measurements,
        condition: result.physical_attributes?.condition || initialAnalysis.physicalAttributes.condition,
        priority: result.physical_attributes?.priority || initialAnalysis.physicalAttributes.priority,
        status: result.physical_attributes?.status || initialAnalysis.physicalAttributes.status,
      },
      inscriptions: {
        signatures: result.inscriptions_marks_labels?.markings || initialAnalysis.inscriptions.signatures,
        hallmarks: result.inscriptions_marks_labels?.interpretation || initialAnalysis.inscriptions.hallmarks,
        additionalIdentifiers: "",
        priority: result.inscriptions_marks_labels?.priority || initialAnalysis.inscriptions.priority,
        status: result.inscriptions_marks_labels?.status || initialAnalysis.inscriptions.status,
      },
      uniqueFeatures: {
        motifs: result.distinguishing_features?.motifs_decorations || initialAnalysis.uniqueFeatures.motifs,
        restoration: result.distinguishing_features?.alterations || initialAnalysis.uniqueFeatures.restoration,
        anomalies: "",
        priority: result.distinguishing_features?.priority || initialAnalysis.uniqueFeatures.priority,
        status: result.distinguishing_features?.status || initialAnalysis.uniqueFeatures.status,
      },
      stylistic: {
        indicators: result.stylistic_assessment?.style_indicators || initialAnalysis.stylistic.indicators,
        estimatedEra: result.stylistic_assessment?.estimated_era || initialAnalysis.stylistic.estimatedEra,
        confidenceLevel: result.stylistic_assessment?.confidence || initialAnalysis.stylistic.confidenceLevel,
        priority: result.stylistic_assessment?.priority || initialAnalysis.stylistic.priority,
        status: result.stylistic_assessment?.status || initialAnalysis.stylistic.status,
      },
      attribution: {
        likelyMaker: result.provenance_and_attribution?.possible_maker || initialAnalysis.attribution.likelyMaker,
        evidence: result.provenance_and_attribution?.rationale || initialAnalysis.attribution.evidence,
        probability: result.provenance_and_attribution?.attribution_priority || initialAnalysis.attribution.probability,
        priority: result.provenance_and_attribution?.priority || initialAnalysis.attribution.priority,
        status: result.provenance_and_attribution?.status || initialAnalysis.attribution.status,
      },
      provenance: {
        infoInPhotos: result.provenance_and_attribution?.hints_of_origin || initialAnalysis.provenance.infoInPhotos,
        historicIndicators: "",
        recommendedFollowup: result.recommendations?.next_steps || initialAnalysis.provenance.recommendedFollowup,
        priority: result.provenance_and_attribution?.priority || initialAnalysis.provenance.priority,
        status: result.provenance_and_attribution?.status || initialAnalysis.provenance.status,
      },
      intake: {
        photoCount: result.identification?.photos || initialAnalysis.intake.photoCount,
        photoQuality: "",
        lightingAngles: "",
        overallImpression: result.identification?.impression || initialAnalysis.intake.overallImpression,
      },
      valueIndicators: {
        factors: result.value_indicators?.factors || initialAnalysis.valueIndicators.factors,
        redFlags: result.value_indicators?.concerns || initialAnalysis.valueIndicators.redFlags,
        references: "",
        followupQuestions: [],
        priority: result.value_indicators?.priority || initialAnalysis.valueIndicators.priority,
        status: result.value_indicators?.status || initialAnalysis.valueIndicators.status,
      },
      summary: result.full_report?.description || initialAnalysis.summary,
      fullReport: result.full_report || initialAnalysis.fullReport,
    };
  } catch (error) {
    console.error("Error refining analysis:", error);
    throw new Error(
      `Failed to refine the analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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
