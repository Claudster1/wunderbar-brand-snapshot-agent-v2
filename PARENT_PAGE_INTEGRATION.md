# Parent Page Integration Guide

This guide explains how to integrate the Brand Snapshot™ iframe with your parent page and update the form section.

## 1. Add Event Listener for Score Updates

Add this script **before the closing `</body>` tag** in your parent page HTML to listen for score updates from the iframe:

```html
<script>
  // Listen for messages from the iframe
  window.addEventListener('message', function(event) {
    // Verify origin for security (update with your actual iframe domain)
    // if (event.origin !== 'https://wunderbar-brand-snapshot-agent-v2-8.vercel.app') return;
    
    if (event.data && event.data.type === 'BRAND_SNAPSHOT_COMPLETE') {
      const scores = event.data.data;
      
      // Call the existing unlockScore function
      unlockScore({
        brandAlignmentScore: scores.brandAlignmentScore,
        pillarScores: scores.pillarScores
      });
      
      // Scroll to the score section
      const scoreSection = document.getElementById('brand-alignment-score');
      if (scoreSection) {
        scoreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
</script>
```

## Updated unlockScore function

Make sure your `unlockScore` function matches this format (it should already be in your HTML):

```javascript
function unlockScore(results) {
  document.getElementById("score-locked").classList.add("hidden");
  document.getElementById("score-unlocked").classList.remove("hidden");

  // Populate final score
  document.getElementById("final-score-number").textContent =
    results.brandAlignmentScore;

  // Customize label
  let label = "Medium alignment";
  if (results.brandAlignmentScore >= 80) label = "Excellent alignment";
  else if (results.brandAlignmentScore <= 59) label = "Needs attention";

  document.getElementById("final-score-label").textContent =
    `${label} (out of 100)`;

  // Meter fill
  document.getElementById("final-meter-fill").style.width =
    results.brandAlignmentScore + "%";

  // Pillars
  // NOTE: Pillars are scored 1-20 (not 1-5) per the new scoring system
  const pillarWrap = document.getElementById("final-pillars");
  pillarWrap.innerHTML = "";

  for (const [pillar, score] of Object.entries(results.pillarScores)) {
    const percent = (score / 20) * 100; // Updated: divide by 20, not 5
    const tagClass = getPillarTagClass(score);
    
    pillarWrap.innerHTML += `
      <div class="bs-pillar-row">
        <div class="bs-pillar-label-wrap">
          <div class="bs-pillar-name">${pillar.charAt(0).toUpperCase() + pillar.slice(1)}</div>
          <span class="bs-pillar-tag ${tagClass}">${score}/20</span>
        </div>
        <div class="bs-pillar-meter">
          <div class="bs-pillar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }
}

function getPillarTagClass(score) {
  // Updated thresholds for 1-20 scale (multiply old 1-5 thresholds by 4)
  if (score >= 18) return "bs-pillar-tag-strong";      // 4.5/5 * 4 = 18/20
  if (score >= 14.8) return "bs-pillar-tag-steady";     // 3.7/5 * 4 = 14.8/20
  if (score >= 11.2) return "bs-pillar-tag-mixed";      // 2.8/5 * 4 = 11.2/20
  if (score >= 8) return "bs-pillar-tag-solid";         // 2.0/5 * 4 = 8/20
  return "bs-pillar-tag-focus";
}
```

## 2. Update Form Section Copy

Replace your existing copy in the FORM + EMBEDDED ACTIVE CAMPAIGN section with this HTML:

```html
<section class="bs-section bs-form-section" id="full-report">
  <div class="bs-container">
    <h2 class="bs-h2">Get Your Complete Brand Snapshot™ Report</h2>

    <p class="bs-sub">
      Your personalized report includes insights for all five pillars, your biggest opportunities, 
      and high-impact next steps to strengthen your brand.
    </p>

    <p class="bs-sub">
      Enter your details below and I'll send your full Brand Snapshot™ straight to your inbox.
    </p>

    <div class="mt-6">
      <!-- Your existing ActiveCampaign embedded form -->
      <form id="_form_5_">
        <!-- Your existing form fields here -->
        
        <!-- Hidden fields for dynamic scores - ADD THESE INSIDE YOUR FORM -->
        <!-- Place them right after your other hidden fields -->
        <input type="hidden" id="ac_brand_alignment_score" name="brand_alignment_score" />
        <input type="hidden" id="ac_positioning_score" name="positioning_score" />
        <input type="hidden" id="ac_messaging_score" name="messaging_score" />
        <input type="hidden" id="ac_visibility_score" name="visibility_score" />
        <input type="hidden" id="ac_credibility_score" name="credibility_score" />
        <input type="hidden" id="ac_conversion_score" name="conversion_score" />
      </form>
    </div>

    <!-- Snapshot+ Upgrade CTA (hidden until form succeeds) -->
    <div id="snapshotPlusCTA" style="display:none; margin-top:32px;">
      <div style="
        padding: 32px;
        background: #e5f6ff;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 8px 22px rgba(7,176,242,0.18);
      ">
        <h3 style="font-size: 1.5rem; color:#021859; font-weight:600; margin-bottom:12px;">
          Ready for deeper insights?
        </h3>

        <p style="font-size: 1rem; color:#0c1526; margin-bottom:24px; max-width:580px; margin-left:auto; margin-right:auto;">
          Upgrade to Brand Snapshot+ to unlock a full diagnostic, brand opportunities map, 
          and personalized recommendations to accelerate your growth.
        </p>

        <a 
          href="https://your-stripe-checkout-link"
          style="
            display:inline-block;
            background:#07B0F2;
            color:#fff;
            padding:14px 28px;
            font-size:1rem;
            border-radius:5px;
            text-decoration:none;
            font-weight:600;
            box-shadow:0 10px 26px rgba(7,176,242,0.35);
            text-transform:uppercase;
          "
        >
          Upgrade to Snapshot+ →
        </a>
      </div>
    </div>
  </div>
</section>
```

**Important Notes:**
- Keep your existing ActiveCampaign form HTML unchanged
- Only replace the copy/text above the form
- Add the hidden score fields inside your form (after other hidden fields)
- The form submission will capture email, name, and scores automatically
- The `id="full-report"` can be used for scrolling/anchor links

**Recommended Micro-copy** (below the form, if not already in your AC form):

```html
<p class="bs-microcopy">
  By submitting your information, you'll also receive helpful AI + branding tips from Wunderbar Digital. 
  No spam — unsubscribe anytime.
</p>
```

## 3. Add Score Update Script

Add this script **BELOW your form section** (but inside the same section) to populate the hidden fields when scores are received:

```html
<script>
  // Function that your brand snapshot agent calls when scores are ready
  window.updateBrandSnapshotScores = function(scores) {
    // Scores = { brandAlignmentScore, positioning, messaging, visibility, credibility, conversion }
    
    document.getElementById("ac_brand_alignment_score").value = scores.brandAlignmentScore || "";
    document.getElementById("ac_positioning_score").value = scores.positioning || "";
    document.getElementById("ac_messaging_score").value = scores.messaging || "";
    document.getElementById("ac_visibility_score").value = scores.visibility || "";
    document.getElementById("ac_credibility_score").value = scores.credibility || "";
    document.getElementById("ac_conversion_score").value = scores.conversion || "";
  };
</script>
```

## 4. Update Score Listener to Populate Hidden Fields

Update your existing `postMessage` listener to also call the score update function:

```html
<script>
  // Listen for messages from the iframe
  window.addEventListener('message', function(event) {
    // Verify origin for security (update with your actual iframe domain)
    // if (event.origin !== 'https://wunderbar-brand-snapshot-agent-v2-8.vercel.app') return;
    
    if (event.data && event.data.type === 'BRAND_SNAPSHOT_COMPLETE') {
      const scores = event.data.data;
      
      // Call the existing unlockScore function
      unlockScore({
        brandAlignmentScore: scores.brandAlignmentScore,
        pillarScores: scores.pillarScores
      });
      
      // Update hidden form fields for ActiveCampaign
      if (window.updateBrandSnapshotScores) {
        window.updateBrandSnapshotScores({
          brandAlignmentScore: scores.brandAlignmentScore,
          positioning: scores.pillarScores.positioning,
          messaging: scores.pillarScores.messaging,
          visibility: scores.pillarScores.visibility,
          credibility: scores.pillarScores.credibility,
          conversion: scores.pillarScores.conversion,
        });
      }
      
      // Scroll to the score section
      const scoreSection = document.getElementById('brand-alignment-score');
      if (scoreSection) {
        scoreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
</script>
```

## 5. Add Success CTA Detection Script

Add this script **JUST UNDER your ActiveCampaign script** to detect form success and show the Snapshot+ CTA:

```html
<script>
  // AC sets this class on the thank-you element when the form succeeds
  document.addEventListener("DOMContentLoaded", function() {
    const observer = new MutationObserver(function() {
      const thankYou = document.querySelector("._form-thank-you");
      if (thankYou && thankYou.style.display === "block") {
        // Hide the default thank-you message if you want:
        // thankYou.style.display = "none";
        
        // Show CTA
        const cta = document.getElementById("snapshotPlusCTA");
        if (cta) {
          cta.style.display = "block";
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
</script>
```

## 6. Security Note

For production, uncomment and update the origin check in the message listener:

```javascript
if (event.origin !== 'https://your-actual-iframe-domain.vercel.app') return;
```

This ensures only messages from your trusted iframe domain are processed.

