import Script from 'next/script'
import { extractPlainTextFromRichtext } from '@/lib/seo-utils'

interface BuildingStructuredDataProps {
  building: any // Use any to handle the complex Payload types
  locale: string
}

export function BuildingStructuredData({ building, locale }: BuildingStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com'
  const buildingPath = locale === 'hu' ? `/epulet/${building.slug}` : `/building/${building.slug}`
  const url = `${baseUrl}/${locale}${buildingPath}`
  
  const description = extractPlainTextFromRichtext(building.summary)
  const fullDescription = [
    extractPlainTextFromRichtext(building.summary),
    extractPlainTextFromRichtext(building.history),
    extractPlainTextFromRichtext(building.style),
    extractPlainTextFromRichtext(building.presentDay)
  ].filter(Boolean).join(' ')

  const images = []
  if (building.featuredImage?.url) {
    images.push(`${baseUrl}${building.featuredImage.url}`)
  }
  if (building.images?.length) {
    building.images.forEach((img: any) => {
      if (img?.url) images.push(`${baseUrl}${img.url}`)
    })
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['Place', 'TouristAttraction', 'HistoricalSite'],
    name: building.name,
    description: description,
    url: url,
    identifier: url,
    ...(images.length > 0 && { image: images }),
    ...(building.position && {
      geo: {
        '@type': 'GeoCoordinates',
        longitude: building.position[0],
        latitude: building.position[1],
      },
    }),
    ...(building.city && building.country && typeof building.city === 'object' && typeof building.country === 'object' && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: building.city.name,
        addressCountry: building.country.name,
      },
    }),
    ...(building.buildingType && typeof building.buildingType === 'object' && {
      additionalType: building.buildingType.name,
    }),
    dateCreated: building.createdAt,
    dateModified: building.updatedAt,
    ...(fullDescription && { detailedDescription: fullDescription }),
    provider: {
      '@type': 'Organization',
      name: 'Heritage Builder',
      url: baseUrl,
    },
    potentialAction: {
      '@type': 'ViewAction',
      target: url,
    },
  }

  return (
    <Script
      id="building-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface CityStructuredDataProps {
  city: any // Use any to handle the complex Payload types
  locale: string
  buildingCount?: number
}

export function CityStructuredData({ city, locale, buildingCount }: CityStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com'
  const cityPath = locale === 'hu' ? `/varos/${city.slug}` : `/city/${city.slug}`
  const url = `${baseUrl}/${locale}${cityPath}`
  
  const description = extractPlainTextFromRichtext(city.description) || 
    `Discover heritage buildings and historical sites in ${city.name}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    description: description,
    url: url,
    identifier: url,
    ...(city.position && {
      geo: {
        '@type': 'GeoCoordinates',
        longitude: city.position[0],
        latitude: city.position[1],
      },
    }),
    ...(city.country && typeof city.country === 'object' && {
      containedInPlace: {
        '@type': 'Country',
        name: city.country.name,
      },
    }),
    ...(buildingCount && {
      touristAttraction: {
        '@type': 'ItemList',
        name: `Heritage Buildings in ${city.name}`,
        numberOfItems: buildingCount,
      },
    }),
    provider: {
      '@type': 'Organization',
      name: 'Heritage Builder',
      url: baseUrl,
    },
  }

  return (
    <Script
      id="city-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface CountryStructuredDataProps {
  country: any // Use any to handle the complex Payload types
  locale: string
  buildingCount?: number
}

export function CountryStructuredData({ country, locale, buildingCount }: CountryStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com'
  const countryPath = locale === 'hu' ? `/orszag/${country.slug}` : `/country/${country.slug}`
  const url = `${baseUrl}/${locale}${countryPath}`
  
  const description = `Explore heritage buildings and historical sites in ${country.name}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Country',
    name: country.name,
    description: description,
    url: url,
    identifier: url,
    ...(country.image?.url && {
      image: `${baseUrl}${country.image.url}`,
    }),
    ...(buildingCount && {
      touristAttraction: {
        '@type': 'ItemList',
        name: `Heritage Buildings in ${country.name}`,
        numberOfItems: buildingCount,
      },
    }),
    provider: {
      '@type': 'Organization',
      name: 'Heritage Builder',
      url: baseUrl,
    },
  }

  return (
    <Script
      id="country-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface WebsiteStructuredDataProps {
  locale: string
}

export function WebsiteStructuredData({ locale }: WebsiteStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com'
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Heritage Builder',
    description: locale === 'hu' 
      ? 'Fedezze fel történelmi épületeket és örökségi helyszíneket' 
      : 'Discover heritage buildings and historical sites',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/kereses/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Heritage Builder',
      url: baseUrl,
    },
    inLanguage: [
      {
        '@type': 'Language',
        name: 'Hungarian',
        alternateName: 'hu',
      },
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en',
      },
    ],
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}