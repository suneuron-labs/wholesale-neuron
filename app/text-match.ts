export function sameFoldedText(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function customerTagLookupValues(tag: string): string[] {
  const trimmed = tag.trim();
  if (!trimmed) {
    return [];
  }

  const letters = [...trimmed].reduce<number[]>((positions, char, index) => {
    if (/[A-Za-z]/.test(char)) {
      positions.push(index);
    }
    return positions;
  }, []);
  if (letters.length > 0 && letters.length <= 6) {
    const values = new Set<string>();
    const variants = 1 << letters.length;
    for (let mask = 0; mask < variants; mask += 1) {
      const chars = [...trimmed];
      letters.forEach((index, bit) => {
        const lower = chars[index].toLowerCase();
        const upper = chars[index].toUpperCase();
        chars[index] = (mask & (1 << bit)) === 0 ? lower : upper;
      });
      values.add(chars.join(""));
    }
    return [...values];
  }

  const title = trimmed.replace(
    /\S+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
  return [...new Set([trimmed, trimmed.toLowerCase(), trimmed.toUpperCase(), title])];
}
