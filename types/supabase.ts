export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Alias for JSONB type to match Postgres
export type JSONB = Json;

export interface Database {
  public: {
    Tables: {
      idea_insights: {
        Row: {
          competitive_advantage: JSONB;
          created_at: string | null;
          critical_issues: JSONB[] | null;
          feasibility: JSONB;
          id: string;
          idea_name: string;
          market_opportunity: JSONB;
          market_timing: JSONB;
          next_steps: JSONB[] | null;
          problem_statement: string;
          product_description: string;
          revenue_potential: JSONB;
          scalability: JSONB;
          target_audience: string;
          total_score: number;
          unique_value_proposition: string;
          updated_at: string | null;
          user_id: string | null;
          validation_status: string;
        };
        Insert: {
          competitive_advantage: JSONB;
          created_at?: string | null;
          critical_issues?: JSONB[] | null;
          feasibility: JSONB;
          id?: string;
          idea_name: string;
          market_opportunity: JSONB;
          market_timing: JSONB;
          next_steps?: JSONB[] | null;
          problem_statement: string;
          product_description: string;
          revenue_potential: JSONB;
          scalability: JSONB;
          target_audience: string;
          total_score: number;
          unique_value_proposition: string;
          updated_at?: string | null;
          user_id?: string | null;
          validation_status: string;
        };
        Update: {
          competitive_advantage?: JSONB;
          created_at?: string | null;
          critical_issues?: JSONB[] | null;
          feasibility?: JSONB;
          id?: string;
          idea_name?: string;
          market_opportunity?: JSONB;
          market_timing?: JSONB;
          next_steps?: JSONB[] | null;
          problem_statement?: string;
          product_description?: string;
          revenue_potential?: JSONB;
          scalability?: JSONB;
          target_audience?: string;
          total_score?: number;
          unique_value_proposition?: string;
          updated_at?: string | null;
          user_id?: string | null;
          validation_status?: string;
        };
      };
      idea_reports: {
        Row: {
          challenges: JSONB[];
          created_at: string | null;
          id: string;
          improvement_areas: JSONB[] | null;
          insight_id: string;
          key_strengths: JSONB;
          mitigation_strategies: JSONB[];
          monetization: JSONB;
          next_steps: JSONB[] | null;
          recommendation: JSONB[];
          refinement_questions: JSONB[];
          summary: string;
          updated_at: string | null;
          url: string;
          user_id: string | null;
        };
        Insert: {
          challenges: JSONB[];
          created_at?: string | null;
          id?: string;
          improvement_areas?: JSONB[] | null;
          insight_id: string;
          key_strengths: JSONB;
          mitigation_strategies: JSONB[];
          monetization: JSONB;
          next_steps?: JSONB[] | null;
          recommendation: JSONB[];
          refinement_questions: JSONB[];
          summary: string;
          updated_at?: string | null;
          url: string;
          user_id?: string | null;
        };
        Update: {
          challenges?: JSONB[];
          created_at?: string | null;
          id?: string;
          improvement_areas?: JSONB[] | null;
          insight_id?: string;
          key_strengths?: JSONB;
          mitigation_strategies?: JSONB[];
          monetization?: JSONB;
          next_steps?: JSONB[] | null;
          recommendation?: JSONB[];
          refinement_questions?: JSONB[];
          summary?: string;
          updated_at?: string | null;
          url?: string;
          user_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
