import OpenAI from "openai";

// Initialize the OpenAI client with the API key from environment variables
// IMPORTANT: Ensure OPENAI_API_KEY is set in your environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read the designated assistant ID from environment variables
// IMPORTANT: Ensure OPENAI_ASSISTANT_ID is set in your environment variables.
const assistantId = process.env.OPENAI_ASSISTANT_ID;

if (!assistantId) {
  // This error is critical as the assistant ID is required for core functionality.
  throw new Error("CRITICAL: OPENAI_ASSISTANT_ID is not set in environment variables. This ID is required to interact with the OpenAI assistant.");
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
  // Formatted HTML content for Gemini output display
  content?: string;
}

function parseAssistantResponse(text: any): any {
  console.log("Raw input to parseAssistantResponse:", text);

  if (typeof text === 'object' && text !== null) {
    if (typeof text.value === 'string') {
      try {
        // Attempt to parse text.value if it's a string
        const parsedValue = JSON.parse(text.value.replace(/^`|`$/g, ''));
        console.log("Successfully parsed object.value:", parsedValue);
        return parsedValue;
      } catch (error) {
        console.warn("Failed to parse object.value string, attempting to parse object directly:", error);
        // Fall through to parsing the object itself if text.value parsing fails
      }
    }
    // If text.value wasn't a string or parsing it failed, try parsing the object itself
    // This handles cases where the object is already the correct JSON structure
    try {
      // Ensure it's not a stringified version of the object
      const directParse = (typeof text === 'string') ? JSON.parse(text) : text;
      console.log("Successfully used direct object or parsed it:", directParse);
      return directParse;
    } catch (error) {
      console.error("Failed to parse object directly:", error);
      // Fall through to string parsing if direct object usage/parsing fails
    }
  }

  if (typeof text === 'string') {
    try {
      // Attempt direct JSON parsing first
      const parsed = JSON.parse(text);
      console.log("Successfully parsed direct JSON string:", parsed);
      return parsed;
    } catch (e1) {
      // If direct parsing fails, try extracting from ```json ... ```
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          console.log("Successfully parsed JSON from code block:", parsed);
          return parsed;
        } catch (e2) {
          console.error("Failed to parse JSON from code block:", e2);
          console.error("Problematic string:", text);
          throw new Error(`Failed to parse JSON from code block: ${e2 instanceof Error ? e2.message : String(e2)}`);
        }
      }
      // Fallback for other string encapsulated JSONs or malformed JSONs
      // This part tries to find a JSON-like structure within a string if other methods fail
      try {
          const valueMatch = text.match(/"value"\s*:\s*"([^"]+)"/);
          if (valueMatch) {
            const valueStr = valueMatch[1].replace(/\\"/g, '"').replace(/^`|`$/g, '');
            const parsed = JSON.parse(valueStr);
            console.log("Successfully parsed value property from string:", parsed);
            return parsed;
          }
      } catch (e3) {
          // Error already logged by previous attempts or this one if it fails
      }
      
      console.error("All string parsing attempts failed. Problematic string:", text, "Original error:", e1);
      throw new Error(`No valid JSON found in response after multiple attempts. Direct parse error: ${e1 instanceof Error ? e1.message : String(e1)}`);
    }
  }

  console.error("Input is not an object or string, or all parsing attempts failed. Raw input:", text);
  throw new Error('Invalid input type or unable to parse JSON from response');
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
      // Helper function to get a value or log a warning if it's missing
      const getField = (obj: any, path: string, defaultValue: any, fieldName: string) => {
        const value = path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj);
        if (value === undefined || value === null || value === "") {
          console.warn(`Missing or empty field in assistant response: ${fieldName}. Using default value: "${defaultValue}"`);
          return defaultValue;
        }
        return value;
      };

      return {
        preliminaryCategory: getField(result, "introduction.category", "Unknown Category", "introduction.category"),
        introduction: {
          title: getField(result, "introduction.title", "N/A", "introduction.title"),
        },
        physicalAttributes: {
          materials: getField(result, "physical_attributes.materials_techniques", "N/A", "physical_attributes.materials_techniques"),
          measurements: getField(result, "physical_attributes.measurements", "N/A", "physical_attributes.measurements"),
          condition: getField(result, "physical_attributes.condition", "N/A", "physical_attributes.condition"),
          priority: getField(result, "physical_attributes.priority", "N/A", "physical_attributes.priority"),
          status: getField(result, "physical_attributes.status", "N/A", "physical_attributes.status")
        },
        inscriptions: {
          signatures: getField(result, "inscriptions_marks_labels.markings", "N/A", "inscriptions_marks_labels.markings"),
          hallmarks: getField(result, "inscriptions_marks_labels.interpretation", "N/A", "inscriptions_marks_labels.interpretation"),
          additionalIdentifiers: "N/A", // Not present in current assistant response
          priority: getField(result, "inscriptions_marks_labels.priority", "N/A", "inscriptions_marks_labels.priority"),
          status: getField(result, "inscriptions_marks_labels.status", "N/A", "inscriptions_marks_labels.status")
        },
        uniqueFeatures: {
          motifs: getField(result, "distinguishing_features.motifs_decorations", "N/A", "distinguishing_features.motifs_decorations"),
          restoration: getField(result, "distinguishing_features.alterations", "N/A", "distinguishing_features.alterations"),
          anomalies: "N/A", // Not present in current assistant response
          priority: getField(result, "distinguishing_features.priority", "N/A", "distinguishing_features.priority"),
          status: getField(result, "distinguishing_features.status", "N/A", "distinguishing_features.status")
        },
        stylistic: {
          indicators: getField(result, "stylistic_assessment.style_indicators", "N/A", "stylistic_assessment.style_indicators"),
          estimatedEra: getField(result, "stylistic_assessment.estimated_era", "N/A", "stylistic_assessment.estimated_era"),
          confidenceLevel: getField(result, "stylistic_assessment.confidence", "N/A", "stylistic_assessment.confidence"),
          priority: getField(result, "stylistic_assessment.priority", "N/A", "stylistic_assessment.priority"),
          status: getField(result, "stylistic_assessment.status", "N/A", "stylistic_assessment.status")
        },
        attribution: {
          likelyMaker: getField(result, "provenance_and_attribution.possible_maker", "N/A", "provenance_and_attribution.possible_maker"),
          evidence: getField(result, "provenance_and_attribution.rationale", "N/A", "provenance_and_attribution.rationale"),
          probability: getField(result, "provenance_and_attribution.attribution_priority", "N/A", "provenance_and_attribution.attribution_priority"), // Assuming attribution_priority maps to probability
          priority: getField(result, "provenance_and_attribution.attribution_priority", "N/A", "provenance_and_attribution.attribution_priority"), // Duplicated from probability as per original
          status: getField(result, "provenance_and_attribution.attribution_status", "N/A", "provenance_and_attribution.attribution_status")
        },
        provenance: {
          infoInPhotos: getField(result, "provenance_and_attribution.hints_of_origin", "N/A", "provenance_and_attribution.hints_of_origin"),
          historicIndicators: "N/A", // Not present in current assistant response
          recommendedFollowup: getField(result, "recommendations.next_steps", "N/A", "recommendations.next_steps"),
          priority: getField(result, "provenance_and_attribution.provenance_priority", "N/A", "provenance_and_attribution.provenance_priority"),
          status: getField(result, "provenance_and_attribution.provenance_status", "N/A", "provenance_and_attribution.provenance_status")
        },
        intake: {
          photoCount: getField(result, "identification.photos", "N/A", "identification.photos"),
          photoQuality: "N/A", // Not present in current assistant response
          lightingAngles: "N/A", // Not present in current assistant response
          overallImpression: getField(result, "identification.impression", "N/A", "identification.impression")
        },
        valueIndicators: {
          factors: getField(result, "value_indicators.factors", "N/A", "value_indicators.factors"),
          redFlags: getField(result, "value_indicators.concerns", "N/A", "value_indicators.concerns"),
          references: "N/A", // Not present in current assistant response
          followupQuestions: [], // Default to empty array
          priority: getField(result, "value_indicators.priority", "N/A", "value_indicators.priority"),
          status: getField(result, "value_indicators.status", "N/A", "value_indicators.status")
        },
        summary: getField(result, "full_report.description", "No summary provided.", "full_report.description"),
        fullReport: getField(result, "full_report", { description: "Full report not available." }, "full_report"), // Provide a default object structure
        content: getField(result, "full_report.description", "No content available.", "full_report.description") // Or handle based on how 'content' is used
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
    let result;
    try {
      result = parseAssistantResponse(jsonContent.text);

      // Validate the response structure
      if (!validateAssistantResponse(result)) {
        // validateAssistantResponse logs the missing fields.
        // Log the entire problematic result for more context during debugging.
        console.error("Validation failed for refined response. Full response object:", JSON.stringify(result, null, 2));
        throw new Error("Refined assistant response is missing required fields. Please check server logs for details of which fields are missing.");
      }
    } catch (error) {
      // Ensure the error is an instance of Error
      const parsingError = error instanceof Error ? error : new Error(String(error));
      console.error("Error during parsing or validation of refined JSON response:", parsingError.message);
      // Log the raw text that caused the error, as it might not be valid JSON.
      console.error("Raw response text that led to error:", jsonContent.text); 
      throw new Error(`Failed to parse or validate the refined analysis response: ${parsingError.message}`);
    }

    // Helper function to get a value or log a warning if it's missing, falling back to initialAnalysis
    const getFieldWithFallback = (
      parsedResult: any,
      initialData: any,
      path: string,
      fieldName: string,
      defaultValue?: any // Optional default if even initialData doesn't have it
    ) => {
      const value = path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, parsedResult);
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
      
      // Fallback to initialAnalysis
      const fallbackValue = path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, initialData);
      if (fallbackValue !== undefined && fallbackValue !== null && fallbackValue !== "") {
        console.warn(`Refined response missing ${fieldName}, using value from initial analysis.`);
        return fallbackValue;
      }

      // If neither has it, use a hardcoded default or "N/A"
      const finalDefault = defaultValue !== undefined ? defaultValue : "N/A";
      console.warn(`Missing field in refined response and initial analysis: ${fieldName}. Using default: "${finalDefault}"`);
      return finalDefault;
    };
    
    return {
      preliminaryCategory: getFieldWithFallback(result, initialAnalysis, "introduction.category", "introduction.category", "Unknown Category"),
      introduction: {
        title: getFieldWithFallback(result, initialAnalysis, "introduction.title", "introduction.title", "N/A"),
      },
      physicalAttributes: {
        materials: getFieldWithFallback(result, initialAnalysis, "physical_attributes.materials_techniques", "physical_attributes.materials_techniques"),
        measurements: getFieldWithFallback(result, initialAnalysis, "physical_attributes.measurements", "physical_attributes.measurements"),
        condition: getFieldWithFallback(result, initialAnalysis, "physical_attributes.condition", "physical_attributes.condition"),
        priority: getFieldWithFallback(result, initialAnalysis, "physical_attributes.priority", "physical_attributes.priority"),
        status: getFieldWithFallback(result, initialAnalysis, "physical_attributes.status", "physical_attributes.status"),
      },
      inscriptions: {
        signatures: getFieldWithFallback(result, initialAnalysis, "inscriptions_marks_labels.markings", "inscriptions_marks_labels.markings"),
        hallmarks: getFieldWithFallback(result, initialAnalysis, "inscriptions_marks_labels.interpretation", "inscriptions_marks_labels.interpretation"),
        additionalIdentifiers: getFieldWithFallback(result, initialAnalysis, "inscriptions.additionalIdentifiers", "inscriptions.additionalIdentifiers", "N/A"),
        priority: getFieldWithFallback(result, initialAnalysis, "inscriptions_marks_labels.priority", "inscriptions_marks_labels.priority"),
        status: getFieldWithFallback(result, initialAnalysis, "inscriptions_marks_labels.status", "inscriptions_marks_labels.status"),
      },
      uniqueFeatures: {
        motifs: getFieldWithFallback(result, initialAnalysis, "distinguishing_features.motifs_decorations", "distinguishing_features.motifs_decorations"),
        restoration: getFieldWithFallback(result, initialAnalysis, "distinguishing_features.alterations", "distinguishing_features.alterations"),
        anomalies: getFieldWithFallback(result, initialAnalysis, "uniqueFeatures.anomalies", "uniqueFeatures.anomalies", "N/A"),
        priority: getFieldWithFallback(result, initialAnalysis, "distinguishing_features.priority", "distinguishing_features.priority"),
        status: getFieldWithFallback(result, initialAnalysis, "distinguishing_features.status", "distinguishing_features.status"),
      },
      stylistic: {
        indicators: getFieldWithFallback(result, initialAnalysis, "stylistic_assessment.style_indicators", "stylistic_assessment.style_indicators"),
        estimatedEra: getFieldWithFallback(result, initialAnalysis, "stylistic_assessment.estimated_era", "stylistic_assessment.estimated_era"),
        confidenceLevel: getFieldWithFallback(result, initialAnalysis, "stylistic_assessment.confidence", "stylistic_assessment.confidence"),
        priority: getFieldWithFallback(result, initialAnalysis, "stylistic_assessment.priority", "stylistic_assessment.priority"),
        status: getFieldWithFallback(result, initialAnalysis, "stylistic_assessment.status", "stylistic_assessment.status"),
      },
      attribution: {
        likelyMaker: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.possible_maker", "provenance_and_attribution.possible_maker"),
        evidence: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.rationale", "provenance_and_attribution.rationale"),
        probability: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.attribution_priority", "provenance_and_attribution.attribution_priority"), // Assuming attribution_priority maps to probability
        priority: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.attribution_priority", "provenance_and_attribution.attribution_priority"), // Duplicated as per original, consider if this should be different
        status: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.attribution_status", "provenance_and_attribution.attribution_status"),
      },
      provenance: {
        infoInPhotos: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.hints_of_origin", "provenance_and_attribution.hints_of_origin"),
        historicIndicators: getFieldWithFallback(result, initialAnalysis, "provenance.historicIndicators", "provenance.historicIndicators", "N/A"),
        recommendedFollowup: getFieldWithFallback(result, initialAnalysis, "recommendations.next_steps", "recommendations.next_steps"),
        priority: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.provenance_priority", "provenance_and_attribution.provenance_priority"),
        status: getFieldWithFallback(result, initialAnalysis, "provenance_and_attribution.provenance_status", "provenance_and_attribution.provenance_status"),
      },
      intake: {
        photoCount: getFieldWithFallback(result, initialAnalysis, "identification.photos", "identification.photos"),
        photoQuality: getFieldWithFallback(result, initialAnalysis, "intake.photoQuality", "intake.photoQuality", "N/A"),
        lightingAngles: getFieldWithFallback(result, initialAnalysis, "intake.lightingAngles", "intake.lightingAngles", "N/A"),
        overallImpression: getFieldWithFallback(result, initialAnalysis, "identification.impression", "identification.impression"),
      },
      valueIndicators: {
        factors: getFieldWithFallback(result, initialAnalysis, "value_indicators.factors", "value_indicators.factors"),
        redFlags: getFieldWithFallback(result, initialAnalysis, "value_indicators.concerns", "value_indicators.concerns"),
        references: getFieldWithFallback(result, initialAnalysis, "valueIndicators.references", "valueIndicators.references", "N/A"),
        followupQuestions: getFieldWithFallback(result, initialAnalysis, "value_indicators.followupQuestions", "value_indicators.followupQuestions", []),
        priority: getFieldWithFallback(result, initialAnalysis, "value_indicators.priority", "value_indicators.priority"),
        status: getFieldWithFallback(result, initialAnalysis, "value_indicators.status", "value_indicators.status"),
      },
      summary: getFieldWithFallback(result, initialAnalysis, "full_report.description", "full_report.description", "No summary provided."),
      fullReport: getFieldWithFallback(result, initialAnalysis, "full_report", "full_report", { description: "Full report not available." }),
      content: getFieldWithFallback(result, initialAnalysis, "full_report.description", "full_report.description", "No content available.")
    };
  } catch (error) {
    // Ensure the error is an instance of Error and re-throw
    const finalError = error instanceof Error ? error : new Error(String(error));
    console.error(`Error in refineAnalysis: ${finalError.message}`);
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
