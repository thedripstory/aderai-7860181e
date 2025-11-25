import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encryptApiKey } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ valid: false, error: "API key is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Test the API key by making a request to Klaviyo's API
    // We'll use the Get Account endpoint which is a simple, low-cost way to validate
    const klaviyoResponse = await fetch(
      "https://a.klaviyo.com/api/accounts/",
      {
        method: "GET",
        headers: {
          "Authorization": `Klaviyo-API-Key ${apiKey}`,
          "revision": "2024-10-15",
          "Accept": "application/json",
        },
      }
    );

    if (klaviyoResponse.ok) {
      const data = await klaviyoResponse.json();
      
      // Encrypt the API key before returning
      const encryptedKey = await encryptApiKey(apiKey);
      
      return new Response(
        JSON.stringify({
          valid: true,
          encryptedKey,
          accountInfo: {
            accountId: data.data?.[0]?.id || null,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      const errorText = await klaviyoResponse.text();
      console.error("Klaviyo API error:", errorText);
      
      return new Response(
        JSON.stringify({
          valid: false,
          error: klaviyoResponse.status === 401 || klaviyoResponse.status === 403
            ? "Invalid API key. Please check your Klaviyo private API key."
            : "Failed to validate API key. Please try again.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error validating Klaviyo key:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: "An unexpected error occurred while validating your API key.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
