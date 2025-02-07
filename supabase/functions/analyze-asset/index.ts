
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const { image } = await req.json();

    // Remove the data URL prefix to get just the base64 data
    const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const imageData = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const prompt = "Analyze this image of a valuable asset. Please provide: 1) A detailed description of what you see 2) An estimated market value range if possible 3) Any notable features or characteristics that make it valuable. Be specific but concise.";

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    // Parse out estimated value (this is a simple example - you might want to make this more sophisticated)
    const valueMatch = text.match(/\$\d{1,3}(,\d{3})*(\.\d{2})?/);
    const estimatedValue = valueMatch ? parseFloat(valueMatch[0].replace(/[$,]/g, '')) : null;

    // Calculate a simple confidence score based on the specificity of the response
    const confidenceScore = text.length > 200 ? 0.8 : 0.5;

    return new Response(
      JSON.stringify({
        analysis: text,
        estimatedValue,
        confidenceScore
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
