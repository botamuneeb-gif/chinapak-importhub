export const launchFlags = {
  enableBulkActions: false,
  enableFactoryPortal: false,
  enableFactoryDatabaseAdmin: false,
  enableGatewayPayments: false,
  enableMessages: false,
  enablePdfServerExport: false,
  enablePhotoUploadInWizard: false,
  enableProfilePages: false,
  enablePublicFmsSignup: false,
  enableVoiceNotes: false,
  showFutureNavItems: false,
  showPortalChromeOnDocumentRoutes: false,
} as const;

export type LaunchFlagKey = keyof typeof launchFlags;
