export const launchFlags = {
  enableBulkActions: false,
  enableFactoryPortal: false,
  enableFactoryDatabaseAdmin: false,
  enableGatewayPayments: false,
  enableMessages: false,
  enablePdfServerExport: false,
  enablePhotoUploadInWizard: true,
  enableProfilePages: false,
  enablePublicFmsSignup: false,
  enableVoiceNotes: true,
  showFutureNavItems: false,
  showPortalChromeOnDocumentRoutes: false,
} as const;

export type LaunchFlagKey = keyof typeof launchFlags;
