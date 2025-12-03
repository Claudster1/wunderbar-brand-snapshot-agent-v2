// app/api/activecampaign/route.ts

import { NextResponse } from "next/server";
import { mapWundyToAC } from "@/src/utils/activeCampaignMapper";

/**
 * ActiveCampaign API Integration
 * 
 * This endpoint receives Wundy's JSON output and syncs it to ActiveCampaign
 * 
 * Required Environment Variables:
 * - ACTIVE_CAMPAIGN_API_KEY: Your ActiveCampaign API token
 * - ACTIVE_CAMPAIGN_API_URL: Your ActiveCampaign API URL (e.g., https://YOUR-ACCOUNT.api-us1.com)
 * 
 * Optional Environment Variables (for custom field IDs):
 * - AC_FIELD_COMPANY_NAME, AC_FIELD_INDUSTRY, etc.
 * 
 * See src/utils/activeCampaignMapper.ts for the full list of field mappings
 */

export async function POST(req: Request) {
  try {
    const wundyJson = await req.json();

    // Validate required environment variables
    if (!process.env.ACTIVE_CAMPAIGN_API_KEY) {
      console.error("[ActiveCampaign API] Missing ACTIVE_CAMPAIGN_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error. Missing ActiveCampaign API key." },
        { status: 500 }
      );
    }

    if (!process.env.ACTIVE_CAMPAIGN_API_URL) {
      console.error("[ActiveCampaign API] Missing ACTIVE_CAMPAIGN_API_URL");
      return NextResponse.json(
        { error: "Server configuration error. Missing ActiveCampaign API URL." },
        { status: 500 }
      );
    }

    // Validate required fields in Wundy JSON
    if (!wundyJson.user?.email) {
      return NextResponse.json(
        { error: "Missing required field: user.email" },
        { status: 400 }
      );
    }

    // Map Wundy JSON to ActiveCampaign format
    const acPayload = mapWundyToAC(wundyJson);

    // ActiveCampaign API endpoint
    const acApiUrl = `${process.env.ACTIVE_CAMPAIGN_API_URL}/api/3/contacts`;

    // First, check if contact exists (by email)
    const checkResponse = await fetch(
      `${process.env.ACTIVE_CAMPAIGN_API_URL}/api/3/contacts?email=${encodeURIComponent(wundyJson.user.email)}`,
      {
        method: "GET",
        headers: {
          "Api-Token": process.env.ACTIVE_CAMPAIGN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    let contactId: string | null = null;
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      if (checkData.contacts && checkData.contacts.length > 0) {
        contactId = checkData.contacts[0].id;
      }
    }

    // Create or update contact
    const acResponse = await fetch(acApiUrl, {
      method: contactId ? "PUT" : "POST",
      headers: {
        "Api-Token": process.env.ACTIVE_CAMPAIGN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(acPayload.contact),
    });

    if (!acResponse.ok) {
      const errorData = await acResponse.json().catch(() => ({}));
      console.error("[ActiveCampaign API] Error:", {
        status: acResponse.status,
        statusText: acResponse.statusText,
        error: errorData,
      });
      
      return NextResponse.json(
        { 
          error: "Failed to sync to ActiveCampaign",
          details: errorData 
        },
        { status: acResponse.status || 500 }
      );
    }

    const acData = await acResponse.json();
    const newContactId = acData.contact?.id || contactId;

    // Apply tags if contact was created/updated successfully
    if (acPayload.tags?.apply && newContactId) {
      try {
        // ActiveCampaign requires tags to be applied separately
        // First, get or create tags, then apply them
        for (const tagName of acPayload.tags.apply) {
          // Try to find existing tag by name
          let tagId: string | null = null;
          
          const searchTagResponse = await fetch(
            `${process.env.ACTIVE_CAMPAIGN_API_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`,
            {
              method: "GET",
              headers: {
                "Api-Token": process.env.ACTIVE_CAMPAIGN_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          if (searchTagResponse.ok) {
            const tagData = await searchTagResponse.json();
            if (tagData.tags && tagData.tags.length > 0) {
              tagId = tagData.tags[0].id;
            }
          }

          // Create tag if it doesn't exist
          if (!tagId) {
            const createTagResponse = await fetch(
              `${process.env.ACTIVE_CAMPAIGN_API_URL}/api/3/tags`,
              {
                method: "POST",
                headers: {
                  "Api-Token": process.env.ACTIVE_CAMPAIGN_API_KEY,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  tag: {
                    tag: tagName,
                    tagType: "contact",
                  },
                }),
              }
            );

            if (createTagResponse.ok) {
              const newTagData = await createTagResponse.json();
              tagId = newTagData.tag.id;
            }
          }

          // Apply tag to contact
          if (tagId) {
            const tagResponse = await fetch(
              `${process.env.ACTIVE_CAMPAIGN_API_URL}/api/3/contactTags`,
              {
                method: "POST",
                headers: {
                  "Api-Token": process.env.ACTIVE_CAMPAIGN_API_KEY,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  contactTag: {
                    contact: newContactId,
                    tag: tagId,
                  },
                }),
              }
            );

            // Don't fail if tag application fails (tag might already be applied)
            if (!tagResponse.ok) {
              const errorText = await tagResponse.text().catch(() => '');
              // Check if error is due to tag already being applied
              if (!errorText.includes('already')) {
                console.warn(`[ActiveCampaign] Failed to apply tag "${tagName}":`, errorText);
              }
            }
          }
        }
      } catch (tagError) {
        console.error("[ActiveCampaign] Tag application error:", tagError);
        // Continue even if tags fail - contact was created/updated
      }
    }

    return NextResponse.json({
      success: true,
      contactId: newContactId,
      message: contactId ? "Contact updated in ActiveCampaign" : "Contact created in ActiveCampaign",
    });
  } catch (err: any) {
    console.error("[ActiveCampaign API] Integration error:", {
      message: err?.message,
      stack: err?.stack,
    });
    
    return NextResponse.json(
      { 
        error: "Failed to sync to ActiveCampaign",
        message: err?.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}

