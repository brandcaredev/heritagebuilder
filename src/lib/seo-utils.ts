import type { Metadata } from 'next';

/**
 * Extract plain text from Lexical richtext content
 * Handles the JSON structure from Payload CMS Lexical editor
 */
export function extractPlainTextFromRichtext(richtext: any): string {
  if (!richtext) return '';
  
  if (typeof richtext === 'string') return richtext;
  
  // Handle Lexical JSON structure
  if (richtext?.root?.children) {
    return extractTextFromLexicalNodes(richtext.root.children);
  }
  
  // Handle other possible structures
  if (Array.isArray(richtext)) {
    return richtext.map(node => extractTextFromNode(node)).join(' ');
  }
  
  return '';
}

function extractTextFromLexicalNodes(nodes: any[]): string {
  return nodes.map(node => extractTextFromNode(node)).filter(Boolean).join(' ');
}

function extractTextFromNode(node: any): string {
  if (!node) return '';
  
  // Text node
  if (node.type === 'text' || node.text) {
    return node.text || '';
  }
  
  // Node with children
  if (node.children && Array.isArray(node.children)) {
    return extractTextFromLexicalNodes(node.children);
  }
  
  // Paragraph or other block nodes
  if (node.type === 'paragraph' || node.type === 'heading') {
    return extractTextFromLexicalNodes(node.children || []);
  }
  
  return '';
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Generate SEO-friendly meta description from richtext content
 */
export function generateMetaDescription(
  richtext: any, 
  fallback?: string, 
  maxLength = 160
): string {
  const plainText = extractPlainTextFromRichtext(richtext) || fallback || '';
  return truncateText(plainText, maxLength);
}

/**
 * Generate page title with site name
 */
export function generatePageTitle(title: string, siteName = 'Heritage Builder'): string {
  return `${title} | ${siteName}`;
}

/**
 * Get canonical URL for a page
 */
export function getCanonicalUrl(path: string, locale?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com';
  const localePath = locale ? `/${locale}` : '';
  return `${baseUrl}${localePath}${path}`;
}

/**
 * Generate Open Graph image URL from media object
 */
export function getOgImageUrl(media: any): string | undefined {
  if (!media?.url) return undefined;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com';
  return `${baseUrl}${media.url}`;
}

/**
 * Create comprehensive metadata object for pages
 */
export function createMetadata({
  title,
  description,
  path,
  locale = 'hu',
  image,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description?: string;
  path: string;
  locale?: string;
  image?: any;
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const pageTitle = generatePageTitle(title);
  const canonical = getCanonicalUrl(path, locale);
  const ogImage = getOgImageUrl(image);

  const metadata: Metadata = {
    title: pageTitle,
    description,
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical,
      languages: {
        'hu': getCanonicalUrl(path, 'hu'),
        'en': getCanonicalUrl(path, 'en'),
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      type,
      locale,
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
  };

  return metadata;
}

/**
 * Generate hreflang links for multilingual pages
 */
export function generateHreflangLinks(path: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heritagebuilder.com';
  
  return {
    'hu': `${baseUrl}/hu${path}`,
    'en': `${baseUrl}/en${path}`,
    'x-default': `${baseUrl}/hu${path}`, // Default to Hungarian
  };
}

/**
 * Extract keywords from text content
 */
export function extractKeywords(text: string, maxKeywords = 10): string[] {
  if (!text) return [];
  
  // Simple keyword extraction - can be enhanced with more sophisticated NLP
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'which', 'their', 'time', 'will'].includes(word));

  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}