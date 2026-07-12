export interface CareQuestionOption {
  code: string;
  label: string;
  requires_support?: boolean;
  allow_note?: boolean;
  requires_secondary?: boolean;
}

export interface StudentCareConversation {
  _id: string;
  signal_type: string;
  signal_scope_key: string;
  signal_snapshot: {
    title: string;
    context_summary?: Array<{ code: string; label: string; value?: string | number | null }>;
  };
  question_template: {
    sent_text: string;
  };
  primary_options: CareQuestionOption[];
  secondary_options_by_primary: Record<string, CareQuestionOption[]>;
  status: string;
  student_primary_answer?: { code: string; label: string };
  student_secondary_answer?: { code: string; label: string };
  student_note?: string;
}

