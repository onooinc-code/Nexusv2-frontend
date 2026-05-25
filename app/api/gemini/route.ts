import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], context = "" } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "GEMINI_API_KEY environment variable is not defined. Please set it in your workspace Secrets configuration." 
        },
        { status: 500 }
      );
    }

    // Lazy initialization of the GoogleGenAI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are Nexus, the advanced, helpful cognitive AI central coordinator for the Nexus platform.
The Nexus platform is a state-of-the-art contact intelligence, multi-agent orchestration, and memory system.

Current Workspace Environment State Context:
${context || 'No specific metadata loaded.'}

Role Guidance:
- Answer queries professionally, clearly, and concisely. Keep formatting neat and organized with light Markdown list items where appropriate.
- You can help users construct hypothetical contacts, coordinate workflows, define agent configuration parameters, and search memory banks.
- Avoid low-quality, artificial tech jargon. Speak like a senior digital colleague.
- Reference workspace entities if matching the context.`;

    // Construct contents
    // Structure chat from previous history or start fresh
    const chatContents = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Append current message
    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I processed your request, but could not produce a text response.";

    return NextResponse.json({
      success: true,
      text: replyText
    });

  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "An error occurred during content generation." 
      },
      { status: 500 }
    );
  }
}
