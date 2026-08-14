import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Plugin } from 'payload'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { Page, Post } from '@/payload-types'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) =>
  doc?.title ? `${doc.title} | Иенево. Берег` : 'Иенево. Берег'

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: { hidden: true },
      hooks: { afterChange: [revalidateRedirects] },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({ generateTitle, generateURL }),
  formBuilderPlugin({
    fields: { payment: false },
    formOverrides: {
      admin: { hidden: true },
      fields: ({ defaultFields }) => defaultFields.map((field) => {
        if ('name' in field && field.name === 'confirmationMessage') {
          return {
            ...field,
            editor: lexicalEditor({
              features: ({ rootFeatures }) => [
                ...rootFeatures,
                FixedToolbarFeature(),
                HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
              ],
            }),
          }
        }
        return field
      }),
    },
    formSubmissionOverrides: { admin: { hidden: true } },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: { hidden: true },
      fields: ({ defaultFields }) => [...defaultFields, ...searchFields],
    },
  }),
]
