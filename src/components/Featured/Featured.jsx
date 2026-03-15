import React from 'react'
import Card from './Card'
import { F } from './featured.style'
const Featured = ({ releases, series }) => {
  if (!releases && !series) return null;

  return (
    <F.Container>
      {releases && releases.length > 0 && <Card name="Lançamentos 2026" data={releases.slice(0, 5)} link="/movies" />}
      {series && series.length > 0 && <Card name="Séries Populares" data={series.slice(0, 5)} link="/tv-series" />}
    </F.Container>
  )
}

export default Featured
