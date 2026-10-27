// Web Speech API text-to-speech with smart LaTeX-to-spoken-English converter

export function cleanLatexForSpeech(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Replace common LaTeX expressions with natural spoken words
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2");
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, "square root of $1");
  cleaned = cleaned.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, "$1th root of $2");
  cleaned = cleaned.replace(/\^2/g, " squared");
  cleaned = cleaned.replace(/\^3/g, " cubed");
  cleaned = cleaned.replace(/\^\{([^}]+)\}/g, " to the power of $1");
  cleaned = cleaned.replace(/_\{([^}]+)\}/g, " sub $1");
  cleaned = cleaned.replace(/_([a-zA-Z0-9])/g, " sub $1");

  // Symbols & Operators
  cleaned = cleaned.replace(/\\times/g, " times ");
  cleaned = cleaned.replace(/\\div/g, " divided by ");
  cleaned = cleaned.replace(/\\pm/g, " plus or minus ");
  cleaned = cleaned.replace(/\\approx/g, " approximately ");
  cleaned = cleaned.replace(/\\neq/g, " not equal to ");
  cleaned = cleaned.replace(/\\le(q)?/g, " less than or equal to ");
  cleaned = cleaned.replace(/\\ge(q)?/g, " greater than or equal to ");
  cleaned = cleaned.replace(/\\rightarrow/g, " gives ");
  cleaned = cleaned.replace(/\\leftarrow/g, " from ");
  cleaned = cleaned.replace(/\\infty/g, " infinity ");
  cleaned = cleaned.replace(/\\int/g, " integral of ");
  cleaned = cleaned.replace(/\\sum/g, " summation ");

  // Greek letters
  cleaned = cleaned.replace(/\\alpha/g, " alpha ");
  cleaned = cleaned.replace(/\\beta/g, " beta ");
  cleaned = cleaned.replace(/\\gamma/g, " gamma ");
  cleaned = cleaned.replace(/\\delta/g, " delta ");
  cleaned = cleaned.replace(/\\Delta/g, " change in ");
  cleaned = cleaned.replace(/\\theta/g, " theta ");
  cleaned = cleaned.replace(/\\lambda/g, " lambda ");
  cleaned = cleaned.replace(/\\mu/g, " micro ");
  cleaned = cleaned.replace(/\\pi/g, " pi ");
  cleaned = cleaned.replace(/\\omega/g, " omega ");
  cleaned = cleaned.replace(/\\phi/g, " phi ");
  cleaned = cleaned.replace(/\\epsilon/g, " epsilon ");
  cleaned = cleaned.replace(/\\rho/g, " rho ");
  cleaned = cleaned.replace(/\\sigma/g, " sigma ");

  // Units and text
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\mathbf\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\left|\\right/g, "");
  cleaned = cleaned.replace(/\\cdot/g, " dot ");

  // Strip dollar signs and backslashes
  cleaned = cleaned.replace(/\$/g, "");
  cleaned = cleaned.replace(/\\/g, " ");

  // Clean excessive spaces and punctuation
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

export class SpeechSpeaker {
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static isSpeaking: boolean = false;
  private static onStateChangeListeners: ((speaking: boolean) => void)[] = [];

  public static addListener(listener: (speaking: boolean) => void) {
    this.onStateChangeListeners.push(listener);
  }

  public static removeListener(listener: (speaking: boolean) => void) {
    this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
  }

  private static notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.onStateChangeListeners.forEach((l) => l(speaking));
  }

  public static speak(text: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text to speech is not supported in this browser.");
      return;
    }

    // Stop current speech
    window.speechSynthesis.cancel();

    const spokenText = cleanLatexForSpeech(text);
    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.0; // normal speed
    utterance.pitch = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith("en-") || v.name.includes("English"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public static stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.notify(false);
    }
  }

  public static getSpeaking(): boolean {
    return this.isSpeaking;
  }
}
