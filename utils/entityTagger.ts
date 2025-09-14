type EntityDict = { [entityType: string]: string[] };
type Analytics = {
  labels: string[];
  objects: string[];
  keywords: string[];
  extracted_text: string;
};

type TaggedFinding = {
  value: string;
  entityType: string | null;
};

export function tagFindings(
  analytics: Analytics,
  entityList: EntityDict
): TaggedFinding[] {
  // Flatten all findings
  const findings = [
    ...analytics.labels,
    ...analytics.objects,
    ...analytics.keywords,
    ...analytics.extracted_text.split(/\s+/),
  ].filter(Boolean);

  // Build lookup map for fast matching
  const entityMap: { [value: string]: string } = {};
  Object.entries(entityList).forEach(([entityType, values]) => {
    values.forEach((v) => {
      entityMap[v.toLowerCase()] = entityType;
    });
  });

  // Tag findings
  return findings.map((value) => {
    const entityType = entityMap[value.toLowerCase()] || null;
    return { value, entityType };
  });
}
