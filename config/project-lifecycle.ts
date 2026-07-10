export const projectLifecycleThresholdsHours = {
  admin_review_pending: 12,
  admin_submission_review_pending: 24,
  awaiting_payment: 24,
  fms_assignment_pending: 24,
  fms_submission_pending: 48,
  importer_info_missing: 48,
  no_project_update: 72,
  payment_verification_pending: 12,
  project_manager_escalation_open: 24,
  report_release_pending: 24,
} as const;

export type ProjectLifecycleThresholdKey =
  keyof typeof projectLifecycleThresholdsHours;

export const projectLifecycleAlertDateBucketTimeZone = "UTC";
