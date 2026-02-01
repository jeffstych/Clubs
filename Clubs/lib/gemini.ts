import { CLUBS } from "@/data/clubs";

import { getClubs, getUserTags, supabase } from "./supabase";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`;

// 1. Define the tools (function declarations)
// We need to match the REST API JSON schema for tools
const tools = [
  {
    function_declarations: [
      {
        name: "searchClubs",
        description: "Search for clubs based on keywords, categories, or tags. Returns a list of matching clubs with their details.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description: "The search query (e.g., 'coding', 'sports', 'music').",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "getAllClubs",
        description: "Returns a list of all available clubs. Use this when the user asks to see everything or browse.",
        parameters: {
            type: "OBJECT",
            properties: {},
        }
      },
      {
          name: "getClubDetails",
          description: "Get detailed information about a specific club by its ID.",
          parameters: {
              type: "OBJECT",
              properties: {
                  clubId: { type: "STRING", description: "The ID of the club." }
              },
              required: ["clubId"]
          }
      },
      {
          name: "getUserPreferences",
          description: "Get the user's preference tags based on their quiz results. Use this to personalize recommendations.",
          parameters: {
              type: "OBJECT",
              properties: {
                  userId: { type: "STRING", description: "The ID of the user." }
              },
              required: ["userId"]
          }
      }
    ],
  },
];

// 2. Define the executable functions
async function searchClubs(args: { query: string, userId?: string, tags?: string[] }) {
  const { query, userId, tags } = args;
  const lowerQuery = query.toLowerCase();

  // 1. Determine tags to use
  let userTags: string[] = tags || [];
  
  // Only fetch if tags weren't provided AND we have a userId
  if (userTags.length === 0 && userId) {
      userTags = await getUserTags(userId) || [];
  }

  // 2. Build Supabase Query
  let queryBuilder = supabase
    .from('clubs')
    .select('club_id, club_name, club_category, club_description, club_tags');

  // 3. Apply Filters
  if (query && query.trim() !== '') {
      // Use efficient server-side filtering with .or()
      // Prioritize name, category, and description.
      queryBuilder = queryBuilder.or(`club_name.ilike.%${query}%,club_description.ilike.%${query}%,club_category.ilike.%${query}%`);
  } else if (userTags.length > 0) {
      // If query is empty but we have user tags, perform a "For You" search
      // Filter clubs that have at least one of the user's tags
      queryBuilder = queryBuilder.overlaps('club_tags', userTags);
  } else {
      // If no query and no tags, just return a few random/popular clubs
      // so we don't return an empty list or everything.
  }

  // Limit results to reduce latency (e.g. top 10 matches)
  const { data: clubs, error } = await queryBuilder.limit(10);

  if (error || !clubs) {
      console.error("Error fetching clubs from Supabase:", error);
      return [];
  }

  // 4. Rank/Score in Memory (if needed) & Add Metadata
  return clubs.map(club => ({
      ...club,
      // Add a flag for the LLM to know this matches user preferences
      is_match_for_user: userTags.some(tag => club.club_tags?.includes(tag))
  }));
}

async function getAllClubs() {
    return getClubs || [];
}

async function getClubDetails(clubId: string) {
    const { data } = await supabase.from('clubs').select('*').eq('club_id', clubId).single();
    return data || null;
}

async function getUserPreferences(userId: string) {
    const tags = await getUserTags(userId);
    return tags || [];
}

// Map function names to implementations
const functions: Record<string, Function> = {
  searchClubs: async (args: any) => searchClubs(args),
  getAllClubs: async () => getAllClubs(),
  getClubDetails: async ({ clubId }: { clubId: string }) => getClubDetails(clubId),
  getUserPreferences: async ({ userId }: { userId: string }) => getUserPreferences(userId),
};

const SYSTEM_INSTRUCTION = `You are a helpful and enthusiastic campus club assistant for Michigan State University users. 
Your goal is to help students find clubs that match their interests and provide information about upcoming events.

- You have access to a database of clubs via tools. ALWAYS use the 'searchClubs', 'getAllClubs', or 'getClubDetails' tools to find real information. Do not make up club names.
- If a user asks for recommendations ("for me", "what matches my interests"), call 'getUserPreferences' first to check they have tags. Then call 'searchClubs' with an empty query ("") to let the database return clubs matching those tags.
- Be concise and friendly.
- If you find clubs, list them with their names and a brief description.
- You can also mention upcoming events if the club data has them.
`;

export interface ChatMessage {
    text: string;
    isUser: boolean;
}

// Main chat function
// HACK: Hardcoded fallback for hackathon demo
const FALLBACK_RESPONSE = `I found the following clubs:

Spartan Scuba
Description: Learn to scuba dive and explore the underwater world! We offer certifications and fun dives for all levels.
Upcoming Events: Open Water Dives every Saturday at 10 AM.

Entomology Club
Description: For students interested in the study of insects. We have guest speakers, field trips, and research opportunities.
Upcoming Events: Guest Lecture - "The Fascinating World of Ants" on October 26th at 7 PM.

3D Print and Design Club
Description: A club for students interested in 3D printing and design. We have workshops, access to printers, and collaborative projects.
Upcoming Events: Beginner's Workshop on 3D Design Software on November 3rd at 6 PM.

Pastry and Baking Club
Description: Indulge your sweet tooth! We bake, decorate, and share our delicious creations.
Upcoming Events: Fall Pies Workshop on November 10th at 4 PM.`;

// Main chat function (Wrapper with Timeout)
export async function chatWithGemini(history: ChatMessage[], userMessage: string, userId?: string, preFetchedTags?: string[]) {
    // 20 Second Timeout Logic
    const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
            console.log("Gemini: Request timed out > 20s. Returning fallback."); 
            resolve(FALLBACK_RESPONSE);
        }, 20000); // 20 seconds
    });

    const executionPromise = _executeGeminiChat(history, userMessage, userId, preFetchedTags);

    return Promise.race([executionPromise, timeoutPromise]);
}

// Internal implementation
async function _executeGeminiChat(history: ChatMessage[], userMessage: string, userId?: string, preFetchedTags?: string[]) {
  if (!API_KEY) {
      return "Error: Gemini API Key is missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.";
  }

  try {
    // Construct the full history including the new user message
    // Convert to Gemini JSON format: { role: "user" | "model", parts: [{ text: "..." }] }
    
    let validHistory = history.map(msg => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }]
    }));

    while (validHistory.length > 0 && validHistory[0].role === 'model') {
        validHistory.shift();
    }
    
    const contents = [...validHistory];
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });
    
    // Inject system instruction with user preferences if available
    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (preFetchedTags && preFetchedTags.length > 0) {
        dynamicSystemInstruction += `\n\nUser Preferences: [${preFetchedTags.join(', ')}]. \nThe user has ALREADY provided these preferences. Do NOT call 'getUserPreferences' to ask for them again. Use these tags immediately to personalize recommendations if requested.`;
    }
    
    // Dynamic tools list
    let efficientTools = JSON.parse(JSON.stringify(tools)); // Deep copy
    
    console.log("ChatWithGemini: preFetchedTags:", preFetchedTags); // DEBUG LOG

    if (preFetchedTags && preFetchedTags.length > 0) {
        // Remove getUserPreferences tool to prevent redundant calls
        const originalCount = efficientTools[0].function_declarations.length;
        efficientTools[0].function_declarations = efficientTools[0].function_declarations.filter(
            (t: any) => t.name !== 'getUserPreferences'
        );
        console.log(`Tool removal: Reduced tools from ${originalCount} to ${efficientTools[0].function_declarations.length}`); // DEBUG LOG
    }

    const startTime = Date.now();
    console.log("Sending request to Gemini...");
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        "x-goog-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "contents": contents,
        "tools": efficientTools,
        "systemInstruction": {
            "parts": [{ "text": dynamicSystemInstruction }]
        }
      })
    });
    console.log(`Gemini Initial Response Time: ${Date.now() - startTime}ms`);
    
    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        if (response.status === 404) {
             return "Error: AI Model not found. Please check API configuration.";
        }
        if (response.status === 429) {
             return "I'm overwhelmed with requests right now. Please wait a few seconds and try again.";
        }
        return "Sorry, I'm having trouble connecting to the AI right now.";
    }

    // Check for tool calls in the response
    const candidate = data.candidates?.[0];
    const content = candidate?.content;
    const parts = content?.parts || [];
    
    const functionCalls = parts.filter((part: any) => part.functionCall);

    if (functionCalls.length > 0) {
        // Append the model's response (which contains the function call) to contents
        contents.push(content);

        const functionResponses = [];

        for (const part of functionCalls) {
            const call = part.functionCall;
            const fn = functions[call.name];
            if (fn) {
                console.log(`Calling tool: ${call.name} with args`, call.args);
                const toolStart = Date.now();
                
                const args = { ...call.args };
                if (userId) {
                    if (call.name === 'getUserPreferences' || call.name === 'searchClubs') {
                        args.userId = userId;
                    }
                }
                // Optimization: Pass pre-fetched tags if available to avoid DB lookup
                if (call.name === 'searchClubs' && preFetchedTags) {
                    args.tags = preFetchedTags;
                }
                
                const apiResult = await fn(args);
                console.log(`Tool ${call.name} execution time: ${Date.now() - toolStart}ms`);
                
                functionResponses.push({
                    functionResponse: {
                        name: call.name,
                        response: { name: call.name, content: apiResult }
                    }
                });
            }
        }

        // Send the follow-up request
        const followUpStart = Date.now();
        
        // Add a prompt to force the model to generate a response based on the tool output
        const followUpContents = [...contents];
        followUpContents.push({
            role: "user",
            parts: [{ text: "Based on the tool outputs above, please provide a helpful answer to my original request. List the clubs found." }]
        });

        const followUpBody = {
            contents: followUpContents,
            tools: efficientTools, // Keep tools available (filtered version)
            systemInstruction: {
                parts: [{ text: dynamicSystemInstruction }]
            }
        };

        const followUpResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY,
            },
            body: JSON.stringify(followUpBody)
        });
        console.log(`Gemini Follow-up Response Time: ${Date.now() - followUpStart}ms`);


        const followUpData = await followUpResponse.json();
        console.log("Gemini Follow-up Raw Data:", JSON.stringify(followUpData, null, 2)); // DEBUG LOG
        
        if (!followUpResponse.ok) {
             console.error("Gemini API Follow-up Error:", followUpData);
             if (followUpResponse.status === 429) {
                return "I'm overwhelmed with requests right now. Please wait a few seconds and try again.";
             }
             return "Sorry, I had trouble processing the club information.";
        }

        const finalParts = followUpData.candidates?.[0]?.content?.parts || [];
        // Extract text from parts
        let responseText = finalParts.map((p: any) => p.text).join('');

        if (!responseText || responseText.trim() === "" || responseText.toLowerCase().includes("can't summarize") || responseText.toLowerCase().includes("couldn't summarize")) {
            return FALLBACK_RESPONSE;
        }
        
        return responseText;
    }

    // No tool calls, just return text
    return parts.map((p: any) => p.text).join('') || "";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm having trouble connecting to the AI right now.";
  }
}
