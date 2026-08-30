import Tesseract from 'tesseract.js';

/**
 * Perform real OCR on image (supports English + Bengali + numbers)
 * Filters out WhatsApp UI junk (timestamps, status, battery, buttons)
 * and formats only meaningful design instructions.
 */
export async function extractWhatsAppTextFromImage(imageSrc, onProgress) {
  try {
    if (onProgress) onProgress('Scanning screenshot text...');

    const result = await Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(`Scanning image: ${pct}%`);
          }
        }
      }
    );

    const rawText = result?.data?.text?.trim() || '';
    if (!rawText) {
      return {
        success: false,
        rawText: '',
        structuredNotes: '⚠️ No readable text detected in screenshot.'
      };
    }

    // WhatsApp UI / noise blacklist patterns
    const noisePatterns = [
      /^[0-9:\sAPMapm.\/,-]+$/, // pure timestamps/numbers like "11:17", "5.37 pm"
      /^(today|yesterday|online|typing|last seen|forwarded|message|chat|status|calls|search|whatsapp)$/i,
      /^(type a message|send|camera|gallery|audio|location|contact|document)$/i,
      /^[0-9]{1,3}%\s*(battery)?/i, // "98%", "100%"
      /^(5g|4g|lte|volte|wifi|kb\/s|mb\/s|am|pm)$/i,
      /^[^\w\u0980-\u09FF]+$/ // pure punctuation/symbols
    ];

    // Process and filter raw lines
    const rawLines = rawText.split('\n');
    const validLines = [];

    for (let line of rawLines) {
      // Remove leading/trailing quotes, ticks, timestamps
      line = line
        .replace(/^[\s\-_~|=>✓•*#]+/, '')
        .replace(/[\s\-_~|=>✓•*#]+$/, '')
        .replace(/\b\d{1,2}:\d{2}\s?(am|pm)?\b/gi, '') // strip embedded times like "11:17 am"
        .trim();

      if (line.length < 3) continue;

      const isNoise = noisePatterns.some(p => p.test(line));
      if (!isNoise) {
        // avoid duplicate lines
        if (!validLines.includes(line)) {
          validLines.push(line);
        }
      }
    }

    // Detect specifications
    const dimRegex = /(\d{2,4}\s?[xX×*]\s?\d{2,4}\s?(mm|cm|px|inch|in)?)|(A[3456]|Legal|Letter)|(\d+\s?(mm|cm|inch)\s?spine)/gi;
    const colorRegex = /(gold\s?foil|silver\s?foil|spot\s?uv|emboss|deboss|navy\s?blue|royal\s?blue|matt\s?lam|gloss\s?lam|leather\s?texture|cmyk|pantone)/gi;

    const detectedDimensions = [];
    const detectedEffects = [];

    validLines.forEach(line => {
      const dimMatch = line.match(dimRegex);
      if (dimMatch) detectedDimensions.push(...dimMatch);

      const colMatch = line.match(colorRegex);
      if (colMatch) detectedEffects.push(...colMatch);
    });

    const uniqueDims = Array.from(new Set(detectedDimensions));
    const uniqueEffects = Array.from(new Set(detectedEffects));

    // Build Clean, Curated Instructions
    let structuredNotes = `📌 Client Requirements:\n`;

    if (validLines.length > 0) {
      validLines.slice(0, 8).forEach(pt => {
        structuredNotes += `• ${pt}\n`;
      });
    } else {
      structuredNotes += `• ${rawText.replace(/\n+/g, ' ').slice(0, 150)}\n`;
    }

    if (uniqueDims.length > 0 || uniqueEffects.length > 0) {
      structuredNotes += `\n📏 Specifications:\n`;
      if (uniqueDims.length > 0) {
        structuredNotes += `• Size: ${uniqueDims.join(', ')}\n`;
      }
      if (uniqueEffects.length > 0) {
        structuredNotes += `• Finish & Effects: ${uniqueEffects.join(', ')}\n`;
      }
    }

    return {
      success: true,
      rawText,
      structuredNotes: structuredNotes.trim(),
      detectedDimensions: uniqueDims.join(', '),
      detectedColors: uniqueEffects.join(', ')
    };
  } catch (err) {
    console.error('OCR Extraction error:', err);
    return {
      success: false,
      rawText: '',
      structuredNotes: `⚠️ Could not parse text automatically. Please refer to attached screenshot.`
    };
  }
}
