package com.oracle.Legal.ai;

import java.util.List;

public class AiDto {

    /* ---------- Request ---------- */
    public static class AnalyzeRequest {
        private String case_type;  // 기존 caseType → case_type
        private String case_text;  // 기존 caseText → case_text

        public String getCase_type() { return case_type; }
        public void setCase_type(String case_type) { this.case_type = case_type; }

        public String getCase_text() { return case_text; }
        public void setCase_text(String case_text) { this.case_text = case_text; }
    }

    /* ---------- Response ---------- */
    public static class AnalyzeResponse {
        private String overall_risk_level;
        private String summary;
        private List<SimilarCase> similar_cases;

        public String getOverall_risk_level() { return overall_risk_level; }
        public void setOverall_risk_level(String overall_risk_level) { this.overall_risk_level = overall_risk_level; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }

        public List<SimilarCase> getSimilar_cases() { return similar_cases; }
        public void setSimilar_cases(List<SimilarCase> similar_cases) { this.similar_cases = similar_cases; }
    }

    public static class SimilarCase {
        private String case_name;
        private String court;
        private String case_number;
        private String outcome;
        private double similarity;
        private String xai_reason;

        public String getCase_name() { return case_name; }
        public void setCase_name(String case_name) { this.case_name = case_name; }

        public String getCourt() { return court; }
        public void setCourt(String court) { this.court = court; }

        public String getCase_number() { return case_number; }
        public void setCase_number(String case_number) { this.case_number = case_number; }

        public String getOutcome() { return outcome; }
        public void setOutcome(String outcome) { this.outcome = outcome; }

        public double getSimilarity() { return similarity; }
        public void setSimilarity(double similarity) { this.similarity = similarity; }

        public String getXai_reason() { return xai_reason; }
        public void setXai_reason(String xai_reason) { this.xai_reason = xai_reason; }
    }
}