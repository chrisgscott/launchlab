// Define the available email templates and their IDs from Brevo
export const EmailTemplateId = {
  VALIDATION_REPORT: 7,
} as const;

// Define the parameters each template expects
export type TemplateParams = {
  [EmailTemplateId.VALIDATION_REPORT]: {
    reportUrl: string;
    score: number;
  };
};

// Helper function to get template description (useful for logging and debugging)
export function getTemplateDescription(
  templateId: (typeof EmailTemplateId)[keyof typeof EmailTemplateId]
): string {
  switch (templateId) {
    case EmailTemplateId.VALIDATION_REPORT:
      return 'Validation Report';
    default:
      return 'Unknown Template';
  }
}

// Validate template parameters at runtime
export function validateTemplateParams(
  templateId: (typeof EmailTemplateId)[keyof typeof EmailTemplateId],
  params: any
): boolean {
  switch (templateId) {
    case EmailTemplateId.VALIDATION_REPORT:
      return typeof params.reportUrl === 'string' && typeof params.score === 'number';
    default:
      return false;
  }
}
