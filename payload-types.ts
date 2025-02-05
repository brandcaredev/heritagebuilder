/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  collections: {
    buildings: Building;
    'buildings-media': BuildingsMedia;
    'building-types': BuildingType;
    'building-types-media': BuildingTypesMedia;
    countries: Country;
    'countries-media': CountriesMedia;
    regions: Region;
    counties: County;
    cities: City;
    'youtube-links': YoutubeLink;
    media: Media;
    users: User;
    'building-suggestions': BuildingSuggestion;
    search: Search;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {
    'building-types': {
      relatedBuildings: 'buildings';
    };
    countries: {
      relatedBuildings: 'buildings';
      relatedCounties: 'counties';
      relatedCities: 'cities';
    };
    regions: {
      relatedCounties: 'counties';
    };
    counties: {
      relatedBuildings: 'buildings';
      relatedCities: 'cities';
    };
    cities: {
      relatedBuildings: 'buildings';
    };
  };
  collectionsSelect: {
    buildings: BuildingsSelect<false> | BuildingsSelect<true>;
    'buildings-media': BuildingsMediaSelect<false> | BuildingsMediaSelect<true>;
    'building-types': BuildingTypesSelect<false> | BuildingTypesSelect<true>;
    'building-types-media': BuildingTypesMediaSelect<false> | BuildingTypesMediaSelect<true>;
    countries: CountriesSelect<false> | CountriesSelect<true>;
    'countries-media': CountriesMediaSelect<false> | CountriesMediaSelect<true>;
    regions: RegionsSelect<false> | RegionsSelect<true>;
    counties: CountiesSelect<false> | CountiesSelect<true>;
    cities: CitiesSelect<false> | CitiesSelect<true>;
    'youtube-links': YoutubeLinksSelect<false> | YoutubeLinksSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    users: UsersSelect<false> | UsersSelect<true>;
    'building-suggestions': BuildingSuggestionsSelect<false> | BuildingSuggestionsSelect<true>;
    search: SearchSelect<false> | SearchSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: number;
  };
  globals: {};
  globalsSelect: {};
  locale: 'en' | 'hu';
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "buildings".
 */
export interface Building {
  id: number;
  name: string;
  slug: string;
  summary: string;
  buildingType: number | BuildingType;
  history: string;
  style: string;
  presentDay: string;
  famousResidents?: string | null;
  renovation?: string | null;
  featuredImage: number | BuildingsMedia;
  images: (number | BuildingsMedia)[];
  /**
   * @minItems 2
   * @maxItems 2
   */
  position: [number, number];
  country: number | Country;
  county?: (number | null) | County;
  city?: (number | null) | City;
  creatorName?: string | null;
  creatorEmail?: string | null;
  suggestionsCount?: number | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "building-types".
 */
export interface BuildingType {
  id: number;
  name: string;
  slug: string;
  image: number | BuildingTypesMedia;
  relatedBuildings?: {
    docs?: (number | Building)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "building-types-media".
 */
export interface BuildingTypesMedia {
  id: number;
  alt?: string | null;
  prefix?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "buildings-media".
 */
export interface BuildingsMedia {
  id: number;
  alt?: string | null;
  prefix?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "countries".
 */
export interface Country {
  id: number;
  name: string;
  countryCode: string;
  slug: string;
  image: number | CountriesMedia;
  relatedBuildings?: {
    docs?: (number | Building)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  relatedCounties?: {
    docs?: (number | County)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  relatedCities?: {
    docs?: (number | City)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "countries-media".
 */
export interface CountriesMedia {
  id: number;
  alt?: string | null;
  prefix?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    main?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "counties".
 */
export interface County {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  /**
   * @minItems 2
   * @maxItems 2
   */
  position?: [number, number] | null;
  country: number | Country;
  region?: (number | null) | Region;
  relatedBuildings?: {
    docs?: (number | Building)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  relatedCities?: {
    docs?: (number | City)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "regions".
 */
export interface Region {
  id: number;
  name: string;
  slug: string;
  country: number | Country;
  relatedCounties?: {
    docs?: (number | County)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "cities".
 */
export interface City {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  /**
   * @minItems 2
   * @maxItems 2
   */
  position?: [number, number] | null;
  country: number | Country;
  county: number | County;
  relatedBuildings?: {
    docs?: (number | Building)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "youtube-links".
 */
export interface YoutubeLink {
  id: number;
  title: string;
  url: string;
  sort: number;
  language: 'en' | 'hu';
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: number;
  alt?: string | null;
  prefix?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: number;
  role: 'admin' | 'moderator';
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "building-suggestions".
 */
export interface BuildingSuggestion {
  id: number;
  building: number | Building;
  field: 'name' | 'summary' | 'history' | 'style' | 'presentDay' | 'famousResidents' | 'renovation';
  suggestedContent: string;
  submitterName?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This is a collection of automatically created search results. These results are used by the global site search and will be updated automatically as documents in the CMS are created or updated.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "search".
 */
export interface Search {
  id: number;
  title?: string | null;
  priority?: number | null;
  doc: {
    relationTo: 'buildings';
    value: number | Building;
  };
  name: string;
  summary?: string | null;
  slug: string;
  buildingType: number | BuildingType;
  featuredImage: number | BuildingsMedia;
  city?: string | null;
  country?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: number;
  document?:
    | ({
        relationTo: 'buildings';
        value: number | Building;
      } | null)
    | ({
        relationTo: 'buildings-media';
        value: number | BuildingsMedia;
      } | null)
    | ({
        relationTo: 'building-types';
        value: number | BuildingType;
      } | null)
    | ({
        relationTo: 'building-types-media';
        value: number | BuildingTypesMedia;
      } | null)
    | ({
        relationTo: 'countries';
        value: number | Country;
      } | null)
    | ({
        relationTo: 'countries-media';
        value: number | CountriesMedia;
      } | null)
    | ({
        relationTo: 'regions';
        value: number | Region;
      } | null)
    | ({
        relationTo: 'counties';
        value: number | County;
      } | null)
    | ({
        relationTo: 'cities';
        value: number | City;
      } | null)
    | ({
        relationTo: 'youtube-links';
        value: number | YoutubeLink;
      } | null)
    | ({
        relationTo: 'media';
        value: number | Media;
      } | null)
    | ({
        relationTo: 'users';
        value: number | User;
      } | null)
    | ({
        relationTo: 'building-suggestions';
        value: number | BuildingSuggestion;
      } | null)
    | ({
        relationTo: 'search';
        value: number | Search;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: number;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "buildings_select".
 */
export interface BuildingsSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  summary?: T;
  buildingType?: T;
  history?: T;
  style?: T;
  presentDay?: T;
  famousResidents?: T;
  renovation?: T;
  featuredImage?: T;
  images?: T;
  position?: T;
  country?: T;
  county?: T;
  city?: T;
  creatorName?: T;
  creatorEmail?: T;
  suggestionsCount?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "buildings-media_select".
 */
export interface BuildingsMediaSelect<T extends boolean = true> {
  alt?: T;
  prefix?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        card?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "building-types_select".
 */
export interface BuildingTypesSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  image?: T;
  relatedBuildings?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "building-types-media_select".
 */
export interface BuildingTypesMediaSelect<T extends boolean = true> {
  alt?: T;
  prefix?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "countries_select".
 */
export interface CountriesSelect<T extends boolean = true> {
  name?: T;
  countryCode?: T;
  slug?: T;
  image?: T;
  relatedBuildings?: T;
  relatedCounties?: T;
  relatedCities?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "countries-media_select".
 */
export interface CountriesMediaSelect<T extends boolean = true> {
  alt?: T;
  prefix?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        main?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "regions_select".
 */
export interface RegionsSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  country?: T;
  relatedCounties?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "counties_select".
 */
export interface CountiesSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  description?: T;
  position?: T;
  country?: T;
  region?: T;
  relatedBuildings?: T;
  relatedCities?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "cities_select".
 */
export interface CitiesSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  description?: T;
  position?: T;
  country?: T;
  county?: T;
  relatedBuildings?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "youtube-links_select".
 */
export interface YoutubeLinksSelect<T extends boolean = true> {
  title?: T;
  url?: T;
  sort?: T;
  language?: T;
  updatedAt?: T;
  createdAt?: T;
  _status?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  prefix?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        card?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  role?: T;
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "building-suggestions_select".
 */
export interface BuildingSuggestionsSelect<T extends boolean = true> {
  building?: T;
  field?: T;
  suggestedContent?: T;
  submitterName?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "search_select".
 */
export interface SearchSelect<T extends boolean = true> {
  title?: T;
  priority?: T;
  doc?: T;
  name?: T;
  summary?: T;
  slug?: T;
  buildingType?: T;
  featuredImage?: T;
  city?: T;
  country?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}