// Used for getting around the issue of using import meta in jest. This is a workaround to allow us to mock the import.meta object in jest tests.
// See LicenseManager.test.ts for an example of how to mock this.
const { MODE: IMPORT_META_ENV } = import.meta && (import.meta as any).env
export { IMPORT_META_ENV }
