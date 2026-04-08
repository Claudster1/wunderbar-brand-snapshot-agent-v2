export type PrintScope = "executive-summary" | "foundation" | "strategy" | "activation";

export function printTab(
  scope: PrintScope,
  meta: {
    businessName: string;
    productName: string;
    date: string;
  },
): void {
  if (typeof document === "undefined") return;
  const scopeClass = `print-scope-${scope}`;
  document.body.classList.add(scopeClass);

  const header = document.createElement("div");
  header.className = "print-header";
  header.innerHTML = `
    <div class="print-header-logo">
      <img
        src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp"
        alt="Wunderbar Digital"
        style="height:18pt;width:auto;display:block;"
      />
    </div>
    <div class="print-header-meta">
      ${meta.productName}<br/>
      ${meta.businessName} · ${meta.date}<br/>
      Confidential — Prepared exclusively for ${meta.businessName}
    </div>
  `;

  const footer = document.createElement("div");
  footer.className = "print-footer";
  footer.textContent = `Confidential — ${meta.businessName} | ${meta.productName} | wunderbardigital.com`;

  document.body.insertBefore(header, document.body.firstChild);
  document.body.appendChild(footer);

  window.print();

  window.setTimeout(() => {
    document.body.classList.remove(scopeClass);
    if (header.parentNode) header.parentNode.removeChild(header);
    if (footer.parentNode) footer.parentNode.removeChild(footer);
  }, 1000);
}
