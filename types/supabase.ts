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

export type LaunchStatus = 'READY FOR LIFTOFF' | 'PREFLIGHT CHECKS NEEDED' | 'MISSION SCRUBBED';

export type AnalysisInsights = {
  // Core Factors (60% of total)
  marketOpportunity: FactorAnalysis;
  competitiveAdvantage: FactorAnalysis;
  feasibility: FactorAnalysis;

  // Supporting Factors (40% of total)
  revenuePotential: FactorAnalysis;
  marketTiming: FactorAnalysis;
  scalability: FactorAnalysis;

  // Overall Analysis
  totalScore: number;
  launchStatus: LaunchStatus;
  criticalIssues: CriticalIssue[];
  nextSteps: NextStep[];
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
  report_data: any; // Will be typed more specifically once we define report structure
  user_id?: string;
};

export type ReportAccess = {
  id: string;
  created_at: string;
  email: string;
  analysis_id: string;
  access_token: string;
  expires_at: string;
};

export type Database = {
  public: {
    Tables: {
      idea_analyses: {
        Row: IdeaAnalysis;
        Insert: Omit<IdeaAnalysis, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IdeaAnalysis, 'id' | 'created_at' | 'updated_at'>>;
      };
      report_access: {
        Row: ReportAccess;
        Insert: Omit<ReportAccess, 'id' | 'created_at'>;
        Update: Partial<Omit<ReportAccess, 'id' | 'created_at'>>;
      };
    };
  };
};
