// Types for our database schema
export type InsightItem = {
  title: string;
  description: string;
};

export type FactorAnalysis = {
  score: number;
  insights: InsightItem[];
};

export type CriticalIssue = {
  issue: string;
  recommendation: string;
};

export type NextStep = {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type ValidationStatus = 'READY TO VALIDATE' | 'NEEDS REFINEMENT' | 'MAJOR CONCERNS';

export type CategoryInsights = {
  score: number;
  insights: Array<{
    title: string;
    description: string;
    actionSteps?: string[];
  }>;
};

export type ReportSummary = {
  marketNeed: string;
  targetAudience: string;
  uniqueValueProposition: string;
  scalabilityPotential: string;
  revenueModel: string;
};

export type TimelinePhase = {
  phase: string;
  duration: string;
  activities: string[];
};

export type SuccessMetric = {
  metric: string;
  description: string;
  target: string;
};

export type Challenge = {
  title: string;
  description: string;
  mitigation: string;
};

export type AnalysisInsights = {
  // Legacy fields for analyze endpoint
  oneLiner: string;
  uniqueValueInsights: string[];
  differentiators: string[];
  targetAudienceInsights: string[];
  painPoints: string[];
  headlines: string[];
  keyBenefits: string[];
  successStories: string[];
  totalScore: number;
  marketOpportunities: string[];
  risks: string[];
  validationStatus: ValidationStatus;
  criticalIssues: CriticalIssue[];
  nextStepsReport: NextStep[];

  // New fields for structured report
  summary: ReportSummary;
  recommendations: NextStep[];
  timeline: TimelinePhase[];
  successMetrics: SuccessMetric[];
  nextSteps: NextStep[];
  strengthsAndChallenges: {
    strengths: InsightItem[];
    challenges: Challenge[];
  };
};

export type IdeaAnalysis = {
  id: string;
  created_at: string;
  updated_at: string;
  problem_statement: string;
  target_audience: string;
  unique_value_proposition: string;
  product_description: string;
  insights: AnalysisInsights;
  report_generated: boolean;
  report_data: string; // JSON string containing the report data
  report_url?: string;
  report_email?: string;
  user_id?: string;
};

export type Database = {
  public: {
    Tables: {
      idea_analyses: {
        Row: IdeaAnalysis;
        Insert: Omit<IdeaAnalysis, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IdeaAnalysis, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
