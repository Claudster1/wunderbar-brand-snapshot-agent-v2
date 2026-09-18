export type ProductFeatureRow = {
  feature: string;
  benefit: string;
};

export type ProductFeatureSection = {
  title: string;
  rows: ProductFeatureRow[];
};

export type ProductFeaturesData = {
  productName: string;
  productHref: string;
  upgradeLead: string;
  upgradeLabel: string;
  upgradeHref: string;
  footnote: string | null;
  sections: ProductFeatureSection[];
};
