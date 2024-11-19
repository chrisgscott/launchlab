// Define the available email templates and their IDs from Brevo
export enum EmailTemplateId {
  WELCOME = 1,  // Update with your actual template ID
  PASSWORD_RESET = 2,  // Update with your actual template ID
  ACCOUNT_VERIFICATION = 3,  // Update with your actual template ID
  // Add more templates as needed
}

// Define the parameters each template expects
export interface WelcomeEmailParams {
  userName: string;
}

export interface PasswordResetParams {
  resetLink: string;
  expiryTime: string;
}

export interface AccountVerificationParams {
  verificationLink: string;
}

// Type to map template IDs to their parameter types
export type TemplateParams = {
  [EmailTemplateId.WELCOME]: WelcomeEmailParams;
  [EmailTemplateId.PASSWORD_RESET]: PasswordResetParams;
  [EmailTemplateId.ACCOUNT_VERIFICATION]: AccountVerificationParams;
};

// Helper function to get template description (useful for logging and debugging)
export function getTemplateDescription(templateId: EmailTemplateId): string {
  const descriptions: Record<EmailTemplateId, string> = {
    [EmailTemplateId.WELCOME]: "Welcome email for new users",
    [EmailTemplateId.PASSWORD_RESET]: "Password reset instructions",
    [EmailTemplateId.ACCOUNT_VERIFICATION]: "Account verification email",
  };
  
  return descriptions[templateId] || "Unknown template";
}

// Validate template parameters at runtime
export function validateTemplateParams<T extends EmailTemplateId>(
  templateId: T,
  params: TemplateParams[T]
): boolean {
  switch (templateId) {
    case EmailTemplateId.WELCOME:
      return typeof (params as WelcomeEmailParams).userName === "string";
    
    case EmailTemplateId.PASSWORD_RESET:
      return (
        typeof (params as PasswordResetParams).resetLink === "string" &&
        typeof (params as PasswordResetParams).expiryTime === "string"
      );
    
    case EmailTemplateId.ACCOUNT_VERIFICATION:
      return typeof (params as AccountVerificationParams).verificationLink === "string";
    
    default:
      return false;
  }
}
