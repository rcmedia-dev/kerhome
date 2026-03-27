export function toPascalCase(text: string) {
    return text
        .toLowerCase()
        .split(/[\s_-]+/)
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}

