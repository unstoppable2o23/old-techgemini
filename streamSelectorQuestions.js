// streamSelectorQuestions.js
// This file should export a `questions` array containing the 76 Likert‑scale items
// extracted from the live test at test.aptitudetest.co.in.
// Each question object has the shape:
// {
//   id: "5023",
//   question: "Do you enjoy participating in community service or volunteering?",
//   domain_id: 173,
//   subdomain_id: "3",
//   options: {
//     "12997": { id: 12997, answer: "Yes", marks: 3, mediatype: 0 },
//     "12998": { id: 12998, answer: "Often", marks: 2, mediatype: 0 },
//     "12999": { id: 12999, answer: "Sometimes", marks: 1, mediatype: 0 },
//     "13000": { id: 13000, answer: "No", marks: 0, mediatype: 0 }
//   },
//   selection_type: 1,
//   questionformat: 1,
//   mediatype: 0,
//   q_theme: 1
// }
// (the full 76‑item array is available in the JSON dump I provided earlier);
// replace the array below with the complete one or import from the JSON file.
export const questions = [
  // --- placeholder: replace with the full 76‑item array ---
  {
    id: "5023",
    question: "Do you enjoy participating in community service or volunteering?",
    domain_id: 173,
    subdomain_id: "3",
    options: {
      "12997": { id: 12997, answer: "Yes", marks: 3 },
      "12998": { id: 12998, answer: "Often", marks: 2 },
      "12999": { id: 12999, answer: "Sometimes", marks: 1 },
      "13000": { id: 13000, answer: "No", marks: 0 }
    },
    selection_type: 1,
    questionformat: 1,
    mediatype: 0,
    q_theme: 1
  }
  // --- end placeholder ---
];