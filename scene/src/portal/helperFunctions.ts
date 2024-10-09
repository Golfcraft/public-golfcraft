export function splitTextIntoLines(
  text: string,
  maxLenght: number,
  maxLines?: number
) {
  let finalText: string = ''
  let textLenth = (text.length > 16) ? 16 : text.length
  for (let i = 0; i < textLenth; i++) {
    const lines = finalText.split('\n')

    if (lines[lines.length - 1].length >= maxLenght && i !== text.length) {
      if (finalText[finalText.length - 1] !== ' ') {
        if (maxLines && lines.length >= maxLines) {
          finalText = finalText.concat('...')
          return finalText
        } else {
          finalText = finalText.concat('-')
        }
      }
      finalText = finalText.concat('\n')
      if (text[i] === ' ') {
        continue
      }
    }

    finalText = finalText.concat(text[i])
  }

  return finalText
}
