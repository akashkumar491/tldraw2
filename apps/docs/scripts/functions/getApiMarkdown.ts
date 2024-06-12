import { APIGroup } from '@/types/content-types'
import { TldrawApiModel } from '@/utils/TldrawApiModel'
import {
	ApiClass,
	ApiConstructSignature,
	ApiConstructor,
	ApiDeclaredItem,
	ApiDocumentedItem,
	ApiEnum,
	ApiFunction,
	ApiInterface,
	ApiItem,
	ApiItemKind,
	ApiMethod,
	ApiMethodSignature,
	ApiNamespace,
	ApiProperty,
	ApiPropertySignature,
	ApiReadonlyMixin,
	ApiReleaseTagMixin,
	ApiStaticMixin,
	ApiTypeAlias,
	ApiVariable,
	Excerpt,
	ReleaseTag,
} from '@microsoft/api-extractor-model'
import { MarkdownWriter, formatWithPrettier, getPath, getSlug } from '../utils'

interface Result {
	markdown: string
	keywords: string[]
}

const REPO_URL = 'https://github.com/tldraw/tldraw/blob/main/'

const date = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
}).format(new Date())

export async function getApiMarkdown(
	model: TldrawApiModel,
	categoryName: string,
	item: ApiItem,
	j: number
) {
	const result: Result = { markdown: '', keywords: [] }
	const toc: Result = { markdown: '', keywords: [] }
	const membersResult: Result = { markdown: '', keywords: [] }

	const isComponent = model.isComponent(item)
	const componentProps = isComponent ? model.getReactPropsItem(item) : null

	const members = componentProps?.members ?? item.members
	if (members) {
		const constructors = []
		const properties = []
		const methods = []
		for (const member of members) {
			switch (member.kind) {
				case ApiItemKind.Constructor:
				case ApiItemKind.ConstructSignature:
					constructors.push(member)
					break
				case ApiItemKind.Variable:
				case ApiItemKind.Property:
				case ApiItemKind.PropertySignature:
					properties.push(member)
					break
				case ApiItemKind.Method:
				case ApiItemKind.Function:
				case ApiItemKind.MethodSignature:
					if (isComponent) {
						properties.push(member)
					} else {
						methods.push(member)
					}

					break
				case ApiItemKind.EnumMember:
				case ApiItemKind.Class:
				case ApiItemKind.TypeAlias:
				case ApiItemKind.Interface:
					// TODO: document these
					break
				default:
					throw new Error(`Unknown member kind: ${member.kind} ${member.displayName}`)
			}
		}

		const constructorResult: Result = { markdown: '', keywords: [] }
		const propertiesResult: Result = { markdown: '', keywords: [] }
		const methodsResult: Result = { markdown: '', keywords: [] }

		if (constructors.length) {
			for (const member of constructors) {
				await addMarkdownForMember(model, constructorResult, member)
				addHorizontalRule(constructorResult)
			}
			addMarkdown(membersResult, constructorResult.markdown)
		}

		if (properties.length || componentProps) {
			addMarkdown(propertiesResult, `## Properties\n\n`)
			if (componentProps) addExtends(propertiesResult, componentProps)
			for (const member of properties) {
				const slug = getSlug(member)
				addMarkdown(toc, `  - [${member.displayName}](#${slug})\n`)
				await addMarkdownForMember(model, propertiesResult, member, {
					isComponentProp: isComponent,
				})
				addHorizontalRule(propertiesResult)
			}
			if (
				componentProps &&
				componentProps instanceof ApiDeclaredItem &&
				componentProps?.kind !== 'Interface'
			) {
				propertiesResult.markdown += await excerptToMarkdown(
					componentProps,
					componentProps.excerpt,
					{
						kind: componentProps.kind,
					}
				)
			}
			if (propertiesResult.markdown.trim()) {
				addMarkdown(toc, `- [Properties](#properties)\n`)
				addMarkdown(membersResult, propertiesResult.markdown)
			}
		}

		if (methods.length) {
			addMarkdown(toc, `- [Methods](#methods)\n`)
			addMarkdown(methodsResult, `## Methods\n\n`)
			for (const member of methods) {
				const slug = getSlug(member)
				addMarkdown(toc, `  - [${member.displayName}](#${slug})\n`)
				await addMarkdownForMember(model, methodsResult, member)
				addHorizontalRule(methodsResult)
			}
			addMarkdown(membersResult, methodsResult.markdown)
		}
	}

	await addFrontmatter(model, result, item, categoryName, j)

	if (toc.markdown.length) {
		result.markdown += `<details className="article__table-of-contents">\n\t<summary>Table of contents</summary>\n`
		addMarkdown(result, toc.markdown)
		result.markdown += `</details>\n\n`
	}

	addTags(model, result, item)

	await addDocComment(model, result, item)

	addLinkToSource(result, item)

	if (membersResult.markdown.length) {
		addHorizontalRule(result)
		addMarkdown(result, membersResult.markdown)
	}

	return result
}

/* --------------------- Helpers -------------------- */

function addMarkdown(result: Result, markdown: string) {
	result.markdown += markdown
}

async function addMarkdownForMember(
	model: TldrawApiModel,
	result: Result,
	member: ApiItem,
	{ isComponentProp = false } = {}
) {
	if (member.displayName.startsWith('_')) return
	addMemberName(result, member)
	addTags(model, result, member, { isComponentProp })
	await addDocComment(model, result, member, { isComponentProp })
}

async function addFrontmatter(
	model: TldrawApiModel,
	result: Result,
	member: ApiItem,
	categoryName: string,
	order: number
) {
	let description = ''
	if (member instanceof ApiDocumentedItem && member.tsdocComment) {
		const comment = await MarkdownWriter.docNodeToMarkdown(
			member,
			member.tsdocComment.summarySection
		)
		// only up to the first newline
		description = comment.trim().split('\n')[0].replace(/:/g, '')
	}

	let kw = ''

	if (result.keywords.length) {
		kw += `\nkeywords:`
		for (const k of result.keywords) {
			if (k.startsWith('_')) continue
			kw += `\n  - ${k.trim().split('\n')[0]}`
		}
	}

	result.markdown += `---
title: ${member.displayName}
status: published
description: ${description}
category: ${categoryName}
group: ${model.isComponent(member) ? APIGroup.Component : member.kind}
author: api
date: ${date}
order: ${order}
sourceUrl: ${'_fileUrlPath' in member ? member._fileUrlPath : ''}${kw}
---
`
}

function addHorizontalRule(result: Result) {
	result.markdown += `---\n\n`
}

function addMemberName(result: Result, member: ApiItem) {
	if (member.kind === 'Constructor') {
		result.markdown += `### Constructor\n\n`
		return
	}

	if (!member.displayName) return
	result.markdown += `### \`${member.displayName}${member.kind === 'Method' ? '()' : ''}\`\n\n`
}

async function addDocComment(
	model: TldrawApiModel,
	result: Result,
	member: ApiItem,
	{ isComponentProp = false } = {}
) {
	if (!(member instanceof ApiDocumentedItem)) {
		return
	}

	const isComponent = model.isComponent(member)

	if (member.tsdocComment) {
		result.markdown += await MarkdownWriter.docNodeToMarkdown(
			member,
			member.tsdocComment.summarySection
		)

		const exampleBlocks = member.tsdocComment.customBlocks.filter(
			(block) => block.blockTag.tagNameWithUpperCase === '@EXAMPLE'
		)

		if (exampleBlocks.length) {
			result.markdown += `\n\n`
			result.markdown += `<ApiHeading>Example</ApiHeading>\n\n`
			for (const example of exampleBlocks) {
				result.markdown += await MarkdownWriter.docNodeToMarkdown(member, example.content)
			}
		}
	}

	if (
		member instanceof ApiVariable ||
		member instanceof ApiTypeAlias ||
		member instanceof ApiProperty ||
		member instanceof ApiPropertySignature ||
		member instanceof ApiClass ||
		member instanceof ApiFunction ||
		member instanceof ApiInterface ||
		member instanceof ApiEnum ||
		member instanceof ApiNamespace ||
		member instanceof ApiMethod
	) {
		if (!isComponentProp) result.markdown += `<ApiHeading>Signature</ApiHeading>\n\n`
		result.markdown += await excerptToMarkdown(member, member.excerpt, {
			kind: member.kind,
		})
		result.markdown += `\n\n`
	}

	if (isComponent) return

	if (
		member instanceof ApiMethod ||
		member instanceof ApiMethodSignature ||
		member instanceof ApiConstructor ||
		member instanceof ApiConstructSignature ||
		member instanceof ApiFunction
	) {
		if (!member.parameters.length) {
			return
		} else {
			result.markdown += `<ApiHeading>Parameters</ApiHeading>\n\n`
			result.markdown += '<ParametersTable>\n\n'
			for (const param of member.parameters) {
				result.markdown += '<ParametersTableRow>\n'
				result.markdown += '<ParametersTableName>\n\n'
				result.markdown += `\`${param.name}\`\n\n`
				result.markdown += `</ParametersTableName>\n`
				result.markdown += `<ParametersTableDescription>\n\n`
				result.markdown += await excerptToMarkdown(member, param.parameterTypeExcerpt, {
					kind: 'ParameterType',
					printWidth: 60,
				})
				result.markdown += `\n\n`
				if (param.tsdocParamBlock) {
					result.markdown += await MarkdownWriter.docNodeToMarkdown(
						member,
						param.tsdocParamBlock.content
					)
				}
				result.markdown += `\n\n</ParametersTableDescription>\n`
				result.markdown += `</ParametersTableRow>\n`
			}
			result.markdown += '</ParametersTable>\n\n'
		}

		if (!(member instanceof ApiConstructor)) {
			result.markdown += `<ApiHeading>Returns</ApiHeading>\n\n`
			result.markdown += await excerptToMarkdown(member, member.returnTypeExcerpt, {
				kind: 'ReturnType',
			})
			result.markdown += `\n\n`
			if (member.tsdocComment && member.tsdocComment.returnsBlock) {
				result.markdown += await MarkdownWriter.docNodeToMarkdown(
					member,
					member.tsdocComment.returnsBlock.content
				)
			}
		}
	} else if (
		member instanceof ApiVariable ||
		member instanceof ApiTypeAlias ||
		member instanceof ApiProperty ||
		member instanceof ApiPropertySignature ||
		member instanceof ApiClass ||
		member instanceof ApiInterface ||
		member instanceof ApiEnum ||
		member instanceof ApiNamespace
	) {
		const params = member.tsdocComment?.params
		if (params && params.count > 0) {
			result.markdown += `<ApiHeading>Parameters</ApiHeading>\n\n`
			result.markdown += '<ParametersTable>\n\n'
			for (const block of params.blocks) {
				result.markdown += '<ParametersTableRow>\n'
				result.markdown += '<ParametersTableName>\n\n'
				result.markdown += `\`${block.parameterName}\`\n\n`
				result.markdown += `</ParametersTableName>\n`
				result.markdown += `<ParametersTableDescription>\n\n`
				result.markdown += await MarkdownWriter.docNodeToMarkdown(member, block.content)
				result.markdown += `\n\n</ParametersTableDescription>\n`
				result.markdown += `</ParametersTableRow>\n`
			}
			result.markdown += '</ParametersTable>\n\n'
		}
	} else {
		model.error(member, `Unknown member kind: ${member.kind}`)
	}
}

async function excerptToMarkdown(
	item: ApiItem,
	excerpt: Excerpt,
	{ kind, printWidth }: { kind: ApiItemKind | 'ReturnType' | 'ParameterType'; printWidth?: number }
) {
	const links = {} as Record<string, string>

	let code = ''
	for (const token of excerpt.spannedTokens) {
		code += token.text

		if (!token.canonicalReference) continue

		const apiItemResult = item
			.getAssociatedModel()!
			.resolveDeclarationReference(token.canonicalReference!, item)

		if (apiItemResult.errorMessage) continue

		const apiItem = apiItemResult.resolvedApiItem!
		const url = `/reference/${getPath(apiItem)}`
		links[token.text] = url
	}

	code = code.replace(/^export /, '')
	code = code.replace(/^declare /, '')

	switch (kind) {
		case ApiItemKind.CallSignature:
		case ApiItemKind.EntryPoint:
		case ApiItemKind.EnumMember:
		case ApiItemKind.Function:
		case ApiItemKind.Model:
		case ApiItemKind.Namespace:
		case ApiItemKind.None:
		case ApiItemKind.Package:
		case ApiItemKind.TypeAlias:
			code = await formatWithPrettier(code, { printWidth })
			break
		case 'ReturnType':
		case 'ParameterType':
			code = await formatWithPrettier(`type X = () =>${code}`, { printWidth })
			if (!code.startsWith('type X = () =>')) {
				throw Error()
			}
			code = code = code.replace(/^type X = \(\) =>[ \n]/, '')
			break
		case ApiItemKind.Class:
		case ApiItemKind.Enum:
		case ApiItemKind.Interface:
			code = await formatWithPrettier(`${code} {}`, { printWidth })
			break
		case ApiItemKind.Constructor:
		case ApiItemKind.ConstructSignature:
		case ApiItemKind.IndexSignature:
		case ApiItemKind.Method:
		case ApiItemKind.MethodSignature:
		case ApiItemKind.Property:
		case ApiItemKind.PropertySignature:
		case ApiItemKind.Variable:
			code = await formatWithPrettier(`class X { ${code} }`, { printWidth })
			if (!(code.startsWith('class X {\n') && code.endsWith('\n}'))) {
				throw Error()
			}
			code = code.slice('class X {\n'.length, -'\n}'.length)
			code = code.replace(/^ {2}/gm, '')
			break
		default:
			throw Error()
	}

	return [
		`<CodeLinkProvider links={${JSON.stringify(links)}}>`,
		'',
		'```ts',
		code,
		'```',
		'',
		'</CodeLinkProvider>',
	].join('\n')
}

function addTags(
	model: TldrawApiModel,
	result: Result,
	member: ApiItem,
	{ isComponentProp = false } = {}
) {
	const tags = []
	if (!isComponentProp) {
		if (ApiReleaseTagMixin.isBaseClassOf(member)) {
			tags.push(ReleaseTag[member.releaseTag])
		}
		if (ApiStaticMixin.isBaseClassOf(member) && member.isStatic) {
			tags.push('static')
		}
		if (ApiReadonlyMixin.isBaseClassOf(member) && member.isReadonly) {
			tags.push('readonly')
		}
	}
	if (member instanceof ApiPropertySignature && member.isOptional) {
		tags.push('optional')
	}
	if (!isComponentProp) {
		const kind = model.isComponent(member) ? 'component' : member.kind.toLowerCase()
		tags.push(kind)
	}
	result.markdown += `<Small>${tags.filter((t) => t.toLowerCase() !== 'none').join(' ')}</Small>\n\n`
}

function addExtends(result: Result, item: ApiItem) {
	const extendsTypes =
		item instanceof ApiClass && item.extendsType
			? [item.extendsType]
			: item instanceof ApiInterface
				? item.extendsTypes
				: []

	if (!extendsTypes.length) return

	result.markdown += `Extends \`${extendsTypes.map((type) => type.excerpt.text).join(', ')}\`.\n\n`
}

function addLinkToSource(result: Result, member: ApiItem) {
	if ('_fileUrlPath' in member && member._fileUrlPath) {
		result.markdown += `<ApiHeading>Source</ApiHeading>\n\n`
		result.markdown += `[${member._fileUrlPath}](${REPO_URL}${member._fileUrlPath})\n\n`
	}
}
