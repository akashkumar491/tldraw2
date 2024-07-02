import { T } from '@tldraw/validate'
import crypto from 'crypto'
import { publishDates } from '../../../version'
import { importPublicKey, str2ab } from '../../utils/licensing'

const GRACE_PERIOD_DAYS = 5

const FLAGS = {
	ANNUAL_LICENSE: 0x1,
	PERPETUAL_LICENSE: 0x2,
	INTERNAL_LICENSE: 0x4,
}

const licenseInfoValidator = T.object({
	expiryDate: T.string,
	customer: T.string,
	validHosts: T.arrayOf(T.string),
	flags: T.number,
	env: T.literalEnum('Production', 'Development'),
})

export type LicenseInfo = T.TypeOf<typeof licenseInfoValidator>
export type InvalidLicenseReason = 'invalid-license-key' | 'no-key-provided'

export type LicenseFromKeyResult = InvalidLicenseKeyResult | ValidLicenseKeyResult

interface InvalidLicenseKeyResult {
	isLicenseValid: false
	reason: InvalidLicenseReason
}

interface ValidLicenseKeyResult {
	isLicenseValid: true
	license: LicenseInfo
	isDomainValid: boolean
	expiryDate: Date
	isAnnualLicense: boolean
	isAnnualLicenseExpired: boolean
	isPerpetualLicense: boolean
	isPerpetualLicenseExpired: boolean
	isInternalLicense: boolean
}

export class LicenseManager {
	private publicKey: string
	private isTest: boolean
	constructor(testPublicKey?: string) {
		this.isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
		this.publicKey = testPublicKey || '3UylteUjvvOL4nKfN8KfjnTbSm6ayj23QihX9TsWPIM='
	}
	private async extractLicenseKey(licenseKey: string): Promise<LicenseInfo> {
		const [data, signature] = licenseKey.split('.')
		const [prefix, encodedData] = data.split('/')

		if (prefix !== 'tldraw') {
			throw new Error(`Unsupported prefix '${prefix}'`)
		}

		const publicCryptoKey = await importPublicKey(this.publicKey)

		try {
			await crypto.subtle.verify(
				{
					name: 'ECDSA',
					hash: { name: 'SHA-384' },
				},
				publicCryptoKey,
				str2ab(signature) as Uint8Array,
				str2ab(encodedData) as Uint8Array
			)
		} catch (e) {
			console.error(e)
			throw new Error('Invalid signature')
		}
		let decodedData: any
		try {
			decodedData = JSON.parse(atob(encodedData))
		} catch (e) {
			throw new Error('Could not parse object')
		}
		return licenseInfoValidator.validate(decodedData)
	}

	async getLicenseFromKey(licenseKey?: string): Promise<LicenseFromKeyResult> {
		if (!licenseKey) {
			this.outputNoLicenseKeyProvided()
			return { isLicenseValid: false, reason: 'no-key-provided' }
		}

		try {
			const licenseInfo = await this.extractLicenseKey(licenseKey)
			const expiryDate = new Date(licenseInfo.expiryDate)
			const isAnnualLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.ANNUAL_LICENSE)
			const isPerpetualLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.PERPETUAL_LICENSE)

			const result: ValidLicenseKeyResult = {
				license: licenseInfo,
				isLicenseValid: true,
				isDomainValid: licenseInfo.validHosts.some(
					(host) => host.toLowerCase() === window.location.hostname.toLowerCase()
				),
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
			return { isLicenseValid: false, reason: 'invalid-license-key' }
		}
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
			'No tldraw license key provided.',
			"Please reach out to hello@tldraw.com if you would like to license tldraw or if you'd like a trial.",
		])
	}

	private outputInvalidLicenseKey() {
		this.outputMessage('Invalid tldraw license key.')
	}

	private outputLicenseInfoIfNeeded(result: ValidLicenseKeyResult) {
		if (result.isAnnualLicenseExpired) {
			this.outputMessages([
				'Your tldraw license has expired.',
				'Please reach out to hello@tldraw.com to renew.',
			])
		}
		if (!result.isDomainValid) {
			this.outputMessages([
				'This tldraw license key is not valid for this domain.',
				'Please reach out to hello@tldraw.com if you would like to use tldraw on other domains.',
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
			console.log(message)
		}
		this.outputDelimiter()
	}

	private outputDelimiter() {
		// eslint-disable-next-line no-console
		console.log('-------------------------------------------------------------------')
	}
}
