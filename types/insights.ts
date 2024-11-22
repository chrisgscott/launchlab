export type CategoryKey =
  | 'market_opportunity'
  | 'competitive_advantage'
  | 'feasibility'
  | 'revenue_potential'
  | 'market_timing'
  | 'scalability';

export type CategoryInsight = {
  score: number;
  insights: Array<{
    title: string;
    description: string;
    action_steps?: string[];
  }>;
  improvement_tips: string[];
};

export type Insights = {
  id: string;
  idea_name: string;
  problem_statement: string;
  target_audience: string;
  unique_value_proposition: string;
  product_description: string;
  total_score: number;
  validation_status: string;
  market_opportunity: CategoryInsight;
  competitive_advantage: CategoryInsight;
  feasibility: CategoryInsight;
  revenue_potential: CategoryInsight;
  market_timing: CategoryInsight;
  scalability: CategoryInsight;
  critical_issues: Array<{
    issue: string;
    recommendation: string;
  }>;
};
