export function removeMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
    .replace(/\[.*?\]\(.*?\)/g, "") // Remove links
    .replace(/`{1,2}[^`](.*?)`{1,2}/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/^[#]+ /gm, "") // Remove headers
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // Remove emphasis
    .replace(/~~(.*?)~~/g, "$1") // Remove strikethrough
    .replace(/> /gm, "") // Remove blockquotes
    .replace(/^\s*\n/gm, "") // Remove empty lines
    .replace(/^\s*-\s+/gm, "") // Remove list items
    .replace(/^\s*\d+\.\s+/gm, ""); // Remove numbered list items
}
