import Tesseract from 'tesseract.js';

/**
 * Perform real OCR on image supporting Bengali (বাংলা) + English + Numbers
 * Uses local fast Bengali trained data from /tessdata/ben.traineddata.gz
 */
export async function extractWhatsAppTextFromImage(imageSrc, onProgress) {
  try {
    if (onProgress) onProgress('বাংলা ও ইংরেজি টেক্সট স্ক্যান করা হচ্ছে...');

    // Recognize both Bengali (ben) and English (eng)
    const result = await Tesseract.recognize(
      imageSrc,
      'ben+eng',
      {
        langPath: '/tessdata',
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(`পড়া হচ্ছে: ${pct}%`);
          }
        }
      }
    );

    const rawText = result?.data?.text?.trim() || '';
    if (!rawText) {
      return {
        success: false,
        rawText: '',
        structuredNotes: '⚠️ স্ক্রিনশটে কোনো স্পষ্ট টেক্সট পাওয়া যায়নি।'
      };
    }

    // WhatsApp UI / noise blacklist patterns
    const noisePatterns = [
      /^[0-9:\sAPMapm.\/,-]+$/, // pure timestamps/numbers like "11:17", "5.37 pm"
      /^(today|yesterday|online|typing|last seen|forwarded|message|chat|status|calls|search|whatsapp)$/i,
      /^(আজকে|কালকে|অনলাইন|মেসেজ|ফরোয়ার্ড|টাইপিং)$/i,
      /^(type a message|send|camera|gallery|audio|location|contact|document)$/i,
      /^[0-9]{1,3}%\s*(battery)?/i, // "98%", "100%"
      /^(5g|4g|lte|volte|wifi|kb\/s|mb\/s|am|pm)$/i,
      /^[^\w\u0980-\u09FF]+$/ // pure punctuation/symbols with no letters or Bengali characters
    ];

    // Process and filter raw lines
    const rawLines = rawText.split('\n');
    const validLines = [];

    for (let line of rawLines) {
      // Remove leading/trailing quotes, ticks, system punctuation
      line = line
        .replace(/^[\s\-_~|=>✓•*#@&$;:.,!?]+/, '')
        .replace(/[\s\-_~|=>✓•*#@&$;:.,!?]+$/, '')
        .replace(/\b\d{1,2}:\d{2}\s?(am|pm)?\b/gi, '') // strip embedded times like "11:17 am"
        .trim();

      // Skip lines with less than 2 meaningful characters unless it's a known short code
      if (line.length < 2) continue;

      // Check if line contains any valid Bengali or alphanumeric character
      const hasContent = /[\u0980-\u09FFa-zA-Z0-9]/.test(line);
      if (!hasContent) continue;

      const isNoise = noisePatterns.some(p => p.test(line));
      if (!isNoise) {
        if (!validLines.includes(line)) {
          validLines.push(line);
        }
      }
    }

    // Detect specifications in both English & Bengali
    const dimRegex = /(\d{2,4}\s?[xX×*]\s?\d{2,4}\s?(mm|cm|px|inch|in)?)|(A[3456]|Legal|Letter)|(\d+\s?(mm|cm|inch)\s?spine)/gi;
    const effectRegex = /(gold\s?foil|silver\s?foil|spot\s?uv|emboss|deboss|navy\s?blue|royal\s?blue|matt\s?lam|gloss\s?lam|leather\s?texture|গোল্ড\s?ফয়েল|এমবস|স্পট\s?ইউভি|লেদার)/gi;

    const detectedDimensions = [];
    const detectedEffects = [];

    validLines.forEach(line => {
      const dimMatch = line.match(dimRegex);
      if (dimMatch) detectedDimensions.push(...dimMatch);

      const effectMatch = line.match(effectRegex);
      if (effectMatch) detectedEffects.push(...effectMatch);
    });

    const uniqueDims = Array.from(new Set(detectedDimensions));
    const uniqueEffects = Array.from(new Set(detectedEffects));

    // Build Clean, Curated Instructions
    let structuredNotes = `📌 Client Requirements:\n`;

    if (validLines.length > 0) {
      validLines.slice(0, 10).forEach(pt => {
        structuredNotes += `• ${pt}\n`;
      });
    } else {
      structuredNotes += `• ${rawText.replace(/\n+/g, ' ').slice(0, 200)}\n`;
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
      structuredNotes: `⚠️ OCR ত্রুটি: টেক্সট পড়া যায়নি (${err.message})।`
    };
  }
}
