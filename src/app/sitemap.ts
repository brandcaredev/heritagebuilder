import { MetadataRoute } from 'next'
import { getBuildings } from '@/lib/queries/building'
import { getCountries } from '@/lib/queries/country'
import { getCitiesByFilter } from '@/lib/queries/city'
import { getBuildingTypes } from '@/lib/queries/building-type'
import { LocaleType } from '@/lib/constans'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.eu'
  const locales: LocaleType[] = ['hu', 'en']
  
  const sitemap: MetadataRoute.Sitemap = []

  // Static pages for each locale
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/map', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/new', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/terms-of-service', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/cookies-policy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/about-us', priority: 0.6, changeFreq: 'monthly' as const },
  ]

  // Add static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: {
            'hu': `${baseUrl}/hu${page.path}`,
            'en': `${baseUrl}/en${page.path}`,
          },
        },
      })
    }
  }

  // Dynamic content for each locale
  for (const locale of locales) {
    try {
      // Buildings
      const buildings = await getBuildings(locale)
      for (const building of buildings) {
        const buildingPath = locale === 'hu' ? `/epulet/${building.slug}` : `/building/${building.slug}`
        const lastModified = building.updatedAt ? new Date(building.updatedAt) : (building.createdAt ? new Date(building.createdAt) : new Date())
        sitemap.push({
          url: `${baseUrl}/${locale}${buildingPath}`,
          lastModified: isNaN(lastModified.getTime()) ? new Date() : lastModified,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              'hu': `${baseUrl}/hu/epulet/${building.slug}`,
              'en': `${baseUrl}/en/building/${building.slug}`,
            },
          },
        })
      }

      // Countries
      const countries = await getCountries(locale)
      for (const country of countries) {
        const countryPath = locale === 'hu' ? `/orszag/${country.slug}` : `/country/${country.slug}`
        const lastModified = country.updatedAt ? new Date(country.updatedAt) : (country.createdAt ? new Date(country.createdAt) : new Date())
        sitemap.push({
          url: `${baseUrl}/${locale}${countryPath}`,
          lastModified: isNaN(lastModified.getTime()) ? new Date() : lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              'hu': `${baseUrl}/hu/orszag/${country.slug}`,
              'en': `${baseUrl}/en/country/${country.slug}`,
            },
          },
        })
      }

      // Cities
      const { cities } = await getCitiesByFilter(locale, {})
      for (const city of cities) {
        const cityPath = locale === 'hu' ? `/varos/${city.slug}` : `/city/${city.slug}`
        const lastModified = city.updatedAt ? new Date(city.updatedAt) : (city.createdAt ? new Date(city.createdAt) : new Date())
        sitemap.push({
          url: `${baseUrl}/${locale}${cityPath}`,
          lastModified: isNaN(lastModified.getTime()) ? new Date() : lastModified,
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              'hu': `${baseUrl}/hu/varos/${city.slug}`,
              'en': `${baseUrl}/en/city/${city.slug}`,
            },
          },
        })
      }

      // Building Types
      const buildingTypes = await getBuildingTypes(locale)
      for (const buildingType of buildingTypes) {
        const typePath = locale === 'hu' ? `/epulet-tipus/${buildingType.slug}` : `/building-type/${buildingType.slug}`
        const lastModified = buildingType.updatedAt ? new Date(buildingType.updatedAt) : (buildingType.createdAt ? new Date(buildingType.createdAt) : new Date())
        sitemap.push({
          url: `${baseUrl}/${locale}${typePath}`,
          lastModified: isNaN(lastModified.getTime()) ? new Date() : lastModified,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              'hu': `${baseUrl}/hu/epulet-tipus/${buildingType.slug}`,
              'en': `${baseUrl}/en/building-type/${buildingType.slug}`,
            },
          },
        })
      }

    } catch (error) {
      console.error(`Error generating sitemap for locale ${locale}:`, error)
    }
  }

  // Remove duplicate URLs (shouldn't happen but safety measure)
  const uniqueUrls = new Map()
  sitemap.forEach(entry => {
    if (!uniqueUrls.has(entry.url)) {
      uniqueUrls.set(entry.url, entry)
    }
  })

  return Array.from(uniqueUrls.values())
}