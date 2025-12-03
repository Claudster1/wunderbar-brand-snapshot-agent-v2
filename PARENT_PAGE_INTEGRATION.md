# Parent Page Integration

## Add this script to your parent page HTML

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
  const pillarWrap = document.getElementById("final-pillars");
  pillarWrap.innerHTML = "";

  for (const [pillar, score] of Object.entries(results.pillarScores)) {
    const percent = (score / 5) * 100;
    const tagClass = getPillarTagClass(score);
    
    pillarWrap.innerHTML += `
      <div class="bs-pillar-row">
        <div class="bs-pillar-label-wrap">
          <div class="bs-pillar-name">${pillar.charAt(0).toUpperCase() + pillar.slice(1)}</div>
          <span class="bs-pillar-tag ${tagClass}">${score}/5</span>
        </div>
        <div class="bs-pillar-meter">
          <div class="bs-pillar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }
}

function getPillarTagClass(score) {
  if (score >= 4.5) return "bs-pillar-tag-strong";
  if (score >= 3.7) return "bs-pillar-tag-steady";
  if (score >= 2.8) return "bs-pillar-tag-mixed";
  if (score >= 2.0) return "bs-pillar-tag-solid";
  return "bs-pillar-tag-focus";
}
```

## Security Note

For production, uncomment and update the origin check in the message listener:

```javascript
if (event.origin !== 'https://your-actual-iframe-domain.vercel.app') return;
```

This ensures only messages from your trusted iframe domain are processed.

