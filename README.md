# CCA Foundations Practice Questions

Structured JSON question bank for the **Claude Certified Architect – Foundations (CCA-F)** exam, parsed from the official practice PDF.

## Contents

| File | Description |
|------|-------------|
| `cca_questions.json` | 105 questions with options, correct answers, and explanations |

## Data Structure

```json
{
  "meta": {
    "title": "CCA Foundations Practice Questions",
    "total_questions": 105,
    "domains": [...],
    "scenarios": [...],
    "exam_info": {
      "min_pass_score": 720,
      "real_exam_questions": 60,
      "official_sample_questions": 12
    }
  },
  "questions": [
    {
      "id": 1,
      "domain": 1,
      "domain_name": "Agentic Architecture & Orchestration",
      "scenario": "Customer Support Resolution Agent",
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correct_answer": "A",
      "explanation": "...",
      "is_official_sample": false
    }
  ]
}
```

## Exam Domains

| # | Domain | Exam Weight |
|---|--------|-------------|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

## Official Exam Scenarios

| # | Scenario |
|---|----------|
| 1 | Customer Support Resolution Agent |
| 2 | Code Generation with Claude Code |
| 3 | Multi-Agent Research System |
| 4 | Developer Productivity with Claude |
| 5 | Claude Code for Continuous Integration |
| 6 | Structured Data Extraction |

## License

MIT — see [LICENSE](LICENSE)
