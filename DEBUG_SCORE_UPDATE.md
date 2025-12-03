# Debugging Score Update Issues

If scores are not updating on the parent page, follow these debugging steps:

## 1. Check Browser Console

Open the browser's Developer Tools (F12) and check the Console tab for messages:

### In the iframe (chat window):
- Look for: `[useBrandChat] Detected JSON response with scores:`
- Look for: `[useBrandChat] Sending scores to parent:`
- Look for: `[useBrandChat] postMessage sent to parent window`
- If you see: `[useBrandChat] Not in an iframe - cannot send postMessage to parent` - the chat is not embedded in an iframe

### On the parent page:
- Look for any JavaScript errors
- Check if the `postMessage` event listener is set up correctly

## 2. Verify Parent Page Has Event Listener

Make sure your parent page has this script (from `PARENT_PAGE_INTEGRATION.md`):

```html
<script>
  // Listen for messages from the iframe
  window.addEventListener('message', function(event) {
    // For debugging, log all messages
    console.log('[Parent] Received message:', event.data);
    
    // Verify origin for security (update with your actual iframe domain)
    // if (event.origin !== 'https://your-iframe-domain.vercel.app') return;
    
    if (event.data && event.data.type === 'BRAND_SNAPSHOT_COMPLETE') {
      console.log('[Parent] BRAND_SNAPSHOT_COMPLETE received:', event.data.data);
      
      const scores = event.data.data;
      
      // Call the existing unlockScore function
      if (typeof unlockScore === 'function') {
        unlockScore({
          brandAlignmentScore: scores.brandAlignmentScore,
          pillarScores: scores.pillarScores
        });
      } else {
        console.error('[Parent] unlockScore function not found!');
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

## 3. Verify unlockScore Function Exists

Make sure your `unlockScore` function is defined and matches this format:

```javascript
function unlockScore(results) {
  console.log('[Parent] unlockScore called with:', results);
  
  // Hide locked state, show unlocked state
  const lockedEl = document.getElementById("score-locked");
  const unlockedEl = document.getElementById("score-unlocked");
  
  if (lockedEl) lockedEl.classList.add("hidden");
  if (unlockedEl) unlockedEl.classList.remove("hidden");

  // Populate final score
  const scoreEl = document.getElementById("final-score-number");
  if (scoreEl) {
    scoreEl.textContent = results.brandAlignmentScore;
  }

  // Customize label
  let label = "Medium alignment";
  if (results.brandAlignmentScore >= 80) label = "Excellent alignment";
  else if (results.brandAlignmentScore <= 59) label = "Needs attention";

  const labelEl = document.getElementById("final-score-label");
  if (labelEl) {
    labelEl.textContent = `${label} (out of 100)`;
  }

  // Meter fill
  const meterFill = document.getElementById("final-meter-fill");
  if (meterFill) {
    meterFill.style.width = results.brandAlignmentScore + "%";
  }

  // Pillars
  const pillarWrap = document.getElementById("final-pillars");
  if (pillarWrap && results.pillarScores) {
    pillarWrap.innerHTML = "";
    
    for (const [pillar, score] of Object.entries(results.pillarScores)) {
      const percent = (score / 20) * 100;
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
}

function getPillarTagClass(score) {
  if (score >= 18) return "bs-pillar-tag-strong";
  if (score >= 14.8) return "bs-pillar-tag-steady";
  if (score >= 11.2) return "bs-pillar-tag-mixed";
  if (score >= 8) return "bs-pillar-tag-solid";
  return "bs-pillar-tag-focus";
}
```

## 4. Test postMessage Manually

You can test if postMessage is working by running this in the browser console on the parent page:

```javascript
// Test if the listener is working
window.addEventListener('message', function(event) {
  console.log('Test message received:', event);
});

// Then in the iframe console, run:
window.parent.postMessage({
  type: 'BRAND_SNAPSHOT_COMPLETE',
  data: {
    brandAlignmentScore: 75,
    pillarScores: {
      positioning: 15,
      messaging: 14,
      visibility: 16,
      credibility: 15,
      conversion: 15
    }
  }
}, '*');
```

## 5. Common Issues

### Issue: "Not in an iframe" warning
**Solution:** Make sure the chat is embedded in an iframe. If testing directly, the postMessage won't work.

### Issue: No console logs from useBrandChat
**Solution:** The JSON might not be detected. Check:
- Is the agent returning valid JSON?
- Does it contain `"scores"` and `"brandAlignmentScore"` keys?
- Check the Network tab to see the actual API response

### Issue: Message received but unlockScore not called
**Solution:** 
- Check if `unlockScore` function exists: `typeof unlockScore === 'function'`
- Check if the DOM elements exist: `document.getElementById("score-locked")`

### Issue: Origin mismatch
**Solution:** If you're using origin verification, make sure the iframe domain matches:
```javascript
if (event.origin !== 'https://your-actual-iframe-domain.vercel.app') return;
```

## 6. Enable Full Debugging

Add this to your parent page script for full debugging:

```javascript
window.addEventListener('message', function(event) {
  console.log('[Parent] Message received from:', event.origin);
  console.log('[Parent] Message data:', event.data);
  console.log('[Parent] Message type:', event.data?.type);
  
  if (event.data && event.data.type === 'BRAND_SNAPSHOT_COMPLETE') {
    console.log('[Parent] Processing BRAND_SNAPSHOT_COMPLETE');
    // ... rest of your code
  }
});
```

