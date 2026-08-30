import Tesseract from 'tesseract.js';

/**
 * Perform real OCR on image (supports English + Bengali + numbers)
 * and extract actionable WhatsApp client requirements.
 */
export async function extractWhatsAppTextFromImage(imageSrc, onProgress) {
  try {
    if (onProgress) onProgress('Scanning screenshot pixels...');

    const result = await Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(`Reading text from WhatsApp screenshot: ${pct}%`);
          }
        }
      }
    );

    const rawText = result?.data?.text?.trim() || '';
    if (!rawText) {
      return {
        success: false,
        rawText: '',
        structuredNotes: '⚠️ No clear text detected in screenshot. Please ensure the screenshot is clear or paste text directly.'
      };
    }

    // Process and clean raw lines
    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2 && !l.match(/^[0-9:\sAPMapm\/]+$/)); // filter empty/timestamp only lines

    // Smart Specification Detectors
    const detectedDimensions = [];
    const detectedColors = [];
    const detectedDates = [];
    const actionPoints = [];

    // Regex matchers
    const dimRegex = /(\d{2,4}\s?[xX×*]\s?\d{2,4}\s?(mm|cm|px|inch|in)?)|(A[3456]|Legal|Letter|Custom)|(\d+\s?(mm|cm|inch)\s?spine)/gi;
    const colorRegex = /(gold\s?foil|silver\s?foil|spot\s?uv|emboss|deboss|navy|blue|black|red|green|cmyk|pantone|matt|gloss|leather)/gi;
    const dateRegex = /(today|tomorrow|urgent|urgent|asap|deadline|delivery|আজকে|কালকে|জরুরি|\d{1,2}[:.]\d{2}\s?(am|pm)?|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/gi;

    lines.forEach(line => {
      // Find dimensions
      const dimMatch = line.match(dimRegex);
      if (dimMatch) detectedDimensions.push(...dimMatch);

      // Find colors/materials
      const colMatch = line.match(colorRegex);
      if (colMatch) detectedColors.push(...colMatch);

      // Find dates
      const dateMatch = line.match(dateRegex);
      if (dateMatch) detectedDates.push(...dateMatch);

      // Clean line for action point
      if (line.length > 5 && !line.startsWith('http')) {
        actionPoints.push(line);
      }
    });

    // Unique specs
    const uniqueDims = Array.from(new Set(detectedDimensions));
    const uniqueColors = Array.from(new Set(detectedColors));
    const uniqueDates = Array.from(new Set(detectedDates));

    // Build Formatted Output
    let structuredNotes = `📸 [WHATSAPP SCREENSHOT TEXT DETECTED]:\n\n`;

    if (uniqueDims.length > 0) {
      structuredNotes += `📏 Detected Dimensions / Sizes: ${uniqueDims.join(', ')}\n`;
    }
    if (uniqueColors.length > 0) {
      structuredNotes += `🎨 Detected Effects / Materials: ${uniqueColors.join(', ')}\n`;
    }
    if (uniqueDates.length > 0) {
      structuredNotes += `⏰ Detected Timeline / Urgency: ${uniqueDates.join(', ')}\n`;
    }

    if (uniqueDims.length > 0 || uniqueColors.length > 0 || uniqueDates.length > 0) {
      structuredNotes += `\n`;
    }

    structuredNotes += `📝 Key Instructions from WhatsApp:\n`;
    const topActionPoints = actionPoints.slice(0, 10);
    if (topActionPoints.length > 0) {
      topActionPoints.forEach(pt => {
        structuredNotes += `• ${pt}\n`;
      });
    } else {
      structuredNotes += `• ${rawText.replace(/\n+/g, ' ')}\n`;
    }

    structuredNotes += `\n💬 Full Recognized Text:\n"${rawText.replace(/\n{2,}/g, '\n')}"`;

    return {
      success: true,
      rawText,
      structuredNotes,
      detectedDimensions: uniqueDims.join(', '),
      detectedColors: uniqueColors.join(', ')
    };
  } catch (err) {
    console.error('OCR Extraction error:', err);
    return {
      success: false,
      rawText: '',
      structuredNotes: `⚠️ OCR Processing Note: Could not parse text automatically (${err.message}). The screenshot is saved as visual reference.`
    };
  }
}
