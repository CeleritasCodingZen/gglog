// Re-export all schemas from the new unified location.
// Keeps existing auth route imports working.
export {
  signupSchema,
  signinSchema,
  profileUpdateSchema,
  logEntrySchema,
  reviewSchema,
  logWithReviewSchema,
  type SignupInput,
  type SigninInput,
  type ProfileUpdateInput,
  type LogEntryInput,
  type ReviewInput,
  type LogWithReviewInput,
} from './schemas'

