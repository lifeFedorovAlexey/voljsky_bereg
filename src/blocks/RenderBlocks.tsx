import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import {
  blockRenderers,
  ContactBookingRenderer,
  isUnavailableBooking,
} from '@/modules/page-builder/renderers'

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          const nextBlock = blocks[index + 1]
          const previousBlock = blocks[index - 1]

          if (blockType === 'booking' && previousBlock?.blockType === 'contacts' && isUnavailableBooking(block)) {
            return null
          }

          if (blockType === 'contacts' && isUnavailableBooking(nextBlock)) {
            return (
              <div key={index}>
                <ContactBookingRenderer booking={nextBlock} contact={block} />
              </div>
            )
          }

          if (blockType && blockType in blockRenderers) {
            const Block = blockRenderers[blockType]

            if (Block) {
              return (
                <div key={index}>
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
