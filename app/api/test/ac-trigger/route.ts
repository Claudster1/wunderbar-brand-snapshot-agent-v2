import { NextResponse } from "next/server";

const AC_URL = process.env.ACTIVE_CAMPAIGN_API_URL!;
const AC_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY!;

export async function POST(req: Request) {
  const body = await req.json();

  const {
    email,
    companyName,
    brandAlignmentScore,
    primaryPillar,
    secondaryPillar,
    stage,
    tag,
    fieldIds,
    fieldValues,
  } = body;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  if (!tag) {
    return NextResponse.json({ error: "Missing tag" }, { status: 400 });
  }

  const resolvedFieldValues =
    Array.isArray(fieldValues) && fieldValues.length > 0
      ? fieldValues
      : fieldIds
      ? [
          { field: fieldIds.companyName, value: companyName },
          { field: fieldIds.brandAlignmentScore, value: brandAlignmentScore },
          { field: fieldIds.primaryPillar, value: primaryPillar },
          { field: fieldIds.secondaryPillar, value: secondaryPillar },
          { field: fieldIds.stage, value: stage },
        ].filter((item) => item.field)
      : [];

  // 1. Create / Update Contact
  const contactRes = await fetch(`${AC_URL}/api/3/contact/sync`, {
    method: "POST",
    headers: {
      "Api-Token": AC_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contact: {
        email,
        ...(resolvedFieldValues.length > 0
          ? { fieldValues: resolvedFieldValues }
          : {}),
      },
    }),
  });

  const contactData = await contactRes.json().catch(() => ({}));
  if (!contactRes.ok) {
    return NextResponse.json(
      { error: "Failed to sync contact", details: contactData },
      { status: contactRes.status }
    );
  }

  const contactId = contactData.contact?.id;
  if (!contactId) {
    return NextResponse.json(
      { error: "Missing contact id", details: contactData },
      { status: 500 }
    );
  }

  // 2. Apply Tag
  const tagRes = await fetch(`${AC_URL}/api/3/contactTags`, {
    method: "POST",
    headers: {
      "Api-Token": AC_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contactTag: {
        contact: contactId,
        tag,
      },
    }),
  });

  const tagData = await tagRes.json().catch(() => ({}));
  if (!tagRes.ok) {
    return NextResponse.json(
      { error: "Failed to apply tag", details: tagData },
      { status: tagRes.status }
    );
  }

  return NextResponse.json({
    success: true,
    contactId,
    message: "ActiveCampaign test trigger fired",
  });
}
