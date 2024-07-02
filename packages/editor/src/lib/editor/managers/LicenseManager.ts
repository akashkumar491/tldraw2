import { T } from '@tldraw/validate'
import { publishDates } from '../../../version'
import { importPublicKey, str2ab } from '../../utils/licensing'

const GRACE_PERIOD_DAYS = 5

const FLAGS = {
	ANNUAL_LICENSE: 0x1,
	PERPETUAL_LICENSE: 0x2,
	INTERNAL_LICENSE: 0x4,
}

const LICENSE_EMAIL = 'sales@tldraw.com'

const licenseInfoValidator = T.object({
	id: T.string,
	env: T.literalEnum('prod', 'dev'),
	hosts: T.arrayOf(T.string),
	customerId: T.string,
	flags: T.number,
	versionNumber: T.string,
	expiryDate: T.string,
	gracePeriod: T.number,
})

export type LicenseInfo = T.TypeOf<typeof licenseInfoValidator>
export type InvalidLicenseReason = 'invalid-license-key' | 'no-key-provided'

export type LicenseFromKeyResult = InvalidLicenseKeyResult | ValidLicenseKeyResult

interface InvalidLicenseKeyResult {
	isLicenseParseable: false
	reason: InvalidLicenseReason
}

interface ValidLicenseKeyResult {
	isLicenseParseable: true
	license: LicenseInfo
	isDevelopmentKey: boolean
	isDomainValid: boolean
	expiryDate: Date
	isAnnualLicense: boolean
	isAnnualLicenseExpired: boolean
	isPerpetualLicense: boolean
	isPerpetualLicenseExpired: boolean
	isInternalLicense: boolean
}

export class LicenseManager {
	private publicKey =
		'-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEPkmEjocP8ldvaSv6BZuhhl+KgrBPn15eckpnYTtVGyqUngQnqdca/4BdZuCwxBR84cvE0MDQ/VnOu/Fyh+K2xr/uewxKqp9OaqqsGnedNdi4ypMZEnWIZkH32wn5BP6W\n-----END PUBLIC KEY-----'

	private isTest: boolean

	constructor(testPublicKey?: string) {
		this.isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
		this.publicKey = testPublicKey || this.publicKey
	}

	private async extractLicenseKey(licenseKey: string): Promise<LicenseInfo> {
		const [data, signature] = licenseKey.split('.')
		const [prefix, encodedData] = data.split('/')

		if (prefix !== 'tldraw') {
			throw new Error(`License: Unsupported prefix '${prefix}'`)
		}

		const publicCryptoKey = await importPublicKey(this.publicKey)

		try {
			await crypto.subtle.verify(
				{
					name: 'ECDSA',
					hash: { name: 'SHA-384' },
				},
				publicCryptoKey,
				new Uint8Array(str2ab(signature)),
				new Uint8Array(str2ab(encodedData))
			)
		} catch (e) {
			console.error(e)
			throw new Error('License: Invalid signature')
		}

		let decodedData: any
		try {
			decodedData = JSON.parse(atob(encodedData))
		} catch (e) {
			throw new Error('License: Could not parse object')
		}

		return licenseInfoValidator.validate(decodedData)
	}

	async getLicenseFromKey(licenseKey?: string): Promise<LicenseFromKeyResult> {
		if (!licenseKey) {
			this.outputNoLicenseKeyProvided()
			return { isLicenseParseable: false, reason: 'no-key-provided' }
		}

		// Borrowed idea from AG Grid:
		// Copying from various sources (like PDFs) can include zero-width characters.
		// This helps makes sure the key validation doesn't fail.
		let cleanedLicenseKey = licenseKey.replace(/[\u200B-\u200D\uFEFF]/g, '')
		cleanedLicenseKey = cleanedLicenseKey.replace(/\r?\n|\r/g, '')

		try {
			const licenseInfo = await this.extractLicenseKey(cleanedLicenseKey)
			const expiryDate = new Date(licenseInfo.expiryDate)
			const isAnnualLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.ANNUAL_LICENSE)
			const isPerpetualLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.PERPETUAL_LICENSE)

			const result: ValidLicenseKeyResult = {
				license: licenseInfo,
				isLicenseParseable: true,
				isDevelopmentKey: licenseInfo.env === 'dev',
				isDomainValid: this.isDomainValid(licenseInfo),
				expiryDate,
				isAnnualLicense,
				isAnnualLicenseExpired: isAnnualLicense && this.isAnnualLicenseExpired(expiryDate),
				isPerpetualLicense,
				isPerpetualLicenseExpired: isPerpetualLicense && this.isPerpetualLicenseExpired(expiryDate),
				isInternalLicense: this.isFlagEnabled(licenseInfo.flags, FLAGS.INTERNAL_LICENSE),
			}
			this.outputLicenseInfoIfNeeded(result)

			return result
		} catch (e) {
			this.outputInvalidLicenseKey()
			// If the license can't be parsed, it's invalid
			return { isLicenseParseable: false, reason: 'invalid-license-key' }
		}
	}

	private isDomainValid(licenseInfo: LicenseInfo) {
		const currentHostname = window.location.hostname.toLowerCase()

		if (['localhost', '127.0.0.1'].includes(currentHostname)) {
			return true
		}

		return licenseInfo.hosts.some((host) => {
			const normalizedHost = host.toLowerCase().trim()
			if (normalizedHost === currentHostname) {
				return true
			}

			// If host is '*', we allow all domains.
			if (host === '*') {
				// All domains allowed.
				return true
			}

			// Glob testing, we only support '*.somedomain.com' right now.
			if (host.includes('*')) {
				const globToRegex = new RegExp(host.replace(/\*/g, '.*?'))
				return globToRegex.test(host)
			}

			return false
		})
	}

	private getExpirationDateWithGracePeriod(expiryDate: Date) {
		return new Date(
			expiryDate.getFullYear(),
			expiryDate.getMonth(),
			expiryDate.getDate() + GRACE_PERIOD_DAYS + 1 // Add 1 day to include the expiration day
		)
	}

	private isAnnualLicenseExpired(expiryDate: Date) {
		const expiration = this.getExpirationDateWithGracePeriod(expiryDate)
		return new Date() >= expiration
	}

	private isPerpetualLicenseExpired(expiryDate: Date) {
		const expiration = this.getExpirationDateWithGracePeriod(expiryDate)
		const dates = {
			major: new Date(publishDates.major),
			minor: new Date(publishDates.minor),
		}
		// We allow patch releases, but the major and minor releases should be within the expiration date
		return dates.major >= expiration || dates.minor >= expiration
	}

	private isFlagEnabled(flags: number, flag: number) {
		return (flags & flag) === flag
	}

	private outputNoLicenseKeyProvided() {
		this.outputMessages([
			'No tldraw license key provided!',
			`Please reach out to ${LICENSE_EMAIL} if you would like to license tldraw or if you'd like a trial.`,
		])
	}

	private outputInvalidLicenseKey() {
		this.outputMessage('Invalid tldraw license key.')
	}

	private outputLicenseInfoIfNeeded(result: ValidLicenseKeyResult) {
		if (result.isAnnualLicenseExpired) {
			this.outputMessages([
				'Your tldraw license has expired!',
				`Please reach out to ${LICENSE_EMAIL} to renew.`,
			])
		}

		if (!result.isDomainValid) {
			this.outputMessages([
				'This tldraw license key is not valid for this domain!',
				`Please reach out to ${LICENSE_EMAIL} if you would like to use tldraw on other domains.`,
			])
		}
	}

	private outputMessage(message: string) {
		this.outputMessages([message])
	}

	private outputMessages(messages: string[]) {
		if (this.isTest) return

		this.outputDelimiter()
		for (const message of messages) {
			// eslint-disable-next-line no-console
			console.log(
				`%c${message}`,
				`color: white; background: crimson; padding: 2px; border-radius: 3px;`
			)
		}
		this.outputDelimiter()
	}

	private outputDelimiter() {
		// eslint-disable-next-line no-console
		console.log(
			'%c-------------------------------------------------------------------',
			`color: white; background: crimson; padding: 2px; border-radius: 3px;`
		)
	}
}
