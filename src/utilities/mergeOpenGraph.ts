import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Отдых на берегу Волги: уютные дома, природа и спокойный ритм.',
  images: [
    {
      url: `${getServerSideURL()}/ienevo-river-pier.jpg`,
    },
  ],
  siteName: 'Иенево. Берег',
  title: 'Иенево. Берег',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
