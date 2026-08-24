// idealCareerQuestions.js
// This file should export a `questions` array containing the 182 Likert‑scale items
// extracted from the live test at test.aptitudetest.co.in (Exam ID 114, Set ID 91).
// Each question object has the shape:
// {
//   id: "5099",
//   question: "Would you prefer going to a party over staying at home?",
//   domain_id: 166,
//   subdomain_id: "274",
//   options: {
//     "13301": { id: 13301, answer: "Yes", marks: 1 },
//     "13302": { id: 13302, answer: "No",  marks: 0 }
//   },
//   selection_type: 1,
//   questionformat: 1,
//   mediatype: 0,
//   q_theme: 1
// }
// (the full 182‑item array is available in the JSON dump I provided earlier);
// replace the array below with the complete one or import from the JSON file.
export const questions = [
  // --- placeholder: replace with the full 182‑item array ---
  {
    id: "5099",
    question: "Would you prefer going to a party over staying at home?",
    domain_id: 166,
    subdomain_id: "274",
    options: {
      "13301": { id: 13301, answer: "Yes", marks: 1 },
      "13302": { id: 13302, answer: "No",  marks: 0 }
    },
    selection_type: 1,
    questionformat: 1,
    mediatype: 0,
    q_theme: 1
  }
  // --- end placeholder ---
];