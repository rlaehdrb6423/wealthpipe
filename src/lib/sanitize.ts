import sanitizeHtml from "sanitize-html"

export function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "br", "a"],
    allowedAttributes: {
      a: ["href", "title"],
    },
    allowedSchemes: ["http", "https"],
  })
}
