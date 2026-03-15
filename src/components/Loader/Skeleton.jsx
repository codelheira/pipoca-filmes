import React from "react"
import { L } from "./loader.style"

function Skeleton() {
  return (
    <L.Wrapper>
      <L.Skeleton>
        <L.Card />
      </L.Skeleton>
      <L.Skeleton>
        <L.Card />
      </L.Skeleton>
      <L.Skeleton>
        <L.Card />
      </L.Skeleton>
      <L.Skeleton>
        <L.Card />
      </L.Skeleton>
      <L.Skeleton>
        <L.Card />
      </L.Skeleton>
      <L.Skeleton>
        <L.Card />
      </L.Skeleton>
    </L.Wrapper>
  )
}

export default Skeleton
