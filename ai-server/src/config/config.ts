export const RELIABLE_CLASSIFICATION_THRESHOLD = 0.8;
export const MAX_USER_MESSAGE_LENGTH = 100;

// How many times we ask the user to clarify before giving up.
export const MAX_CLARIFICATION_ATTEMPTS = 3;

// One message per clarification round. The wording escalates slightly so the
export const CLARIFICATION_MESSAGES = [
  "I'm not sure I fully understood your request. Could you please clarify what you need?",
  "I'm still having trouble understanding. Could you rephrase it or add a bit more detail?",
  "Sorry, I want to get this right — could you describe your request in a different way?",
];

// Sent once we have exhausted MAX_CLARIFICATION_ATTEMPTS and still cannot
export const UNRESOLVED_CLARIFICATION_MESSAGE =
  "Thanks for your patience. I'm still unable to understand your request, so I'm escalating this to a human agent who will follow up with you.";
