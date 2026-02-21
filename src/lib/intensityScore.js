const WINDOW_MS = 30000;

const state = {
  keyTimestamps: [],
  backspaceCount: 0,
  burstDetected: false,
  lastKeyTime: null,
  inactivityThreshold: 4000,
  negativePhraseCounts: 0,
  uniqueNegativeHits: new Set(),
  repeatedHits: 0,
};

const negativePhrases = [
  // Self blame
  "useless","worthless","pathetic","stupid","idiot","failure","loser",
  "i am the problem","im the problem","i ruin everything","im ruining everything",
  "my fault","i hate myself","im so stupid","im stupid",
  "i am not enough","im not enough","not good enough","bad person","terrible person",
  "i shouldnt exist","i should not exist","why am i like this","what is wrong with me",
  "i disappoint everyone","i mess everything up","i always fail",
  "no one needs me","i dont deserve","i am embarrassing","im embarrassing",
  "i am a burden","im a burden","im annoying","i am unwanted","im unwanted",
  "i am replaceable","im replaceable","i did nothing right",
  "i am incapable","im incapable","im broken","im defective",
  "im hopeless","im incompetent","im weak","im useless",
  "i ruin peoples mood","i bring problems","i make things worse",
  "i shouldnt talk","i shouldnt try","i cant do anything right",
  "i never learn","i keep messing up","i dont matter",
  "people are better without me","im the worst","im a mistake",
  "i hate who i am","im ashamed of myself","im not worthy",
  "im a disappointment","im letting everyone down",
  "im holding everyone back","im the reason things fail",
  "i am worthless","i am useless","i am pathetic","i am stupid",
  "im so worthless","im so useless","im so pathetic",

  // Catastrophic
  "everything is ruined","whole life ruined","its over","completely over",
  "nothing works","nothing ever works","never gets better","always happens",
  "this always happens","i can never win","i will never recover",
  "no point anymore","too late now","permanently damaged",
  "no future","life is pointless","im done with everything",
  "i cant take this anymore","this is the worst","hopeless situation",
  "there is no way out","it will never change","forever like this",
  "i always","i never","everything is ruined","i cant do anything",

  // Rumination
  "keep thinking","again and again","over and over",
  "cant stop thinking","stuck in my head","thinking all day",
  "thinking all night","my mind wont stop","looping in my head",
  "replaying it","reliving it","thinking too much",
  "i cant let it go","why did i do that","what did i do wrong",
  "going in circles","thinking nonstop","my brain wont rest",
  "stuck on the past","cant move on","cant get it out of my head",
  "mind racing","i keep remembering","thinking endlessly",
  "i overanalyze everything","cant stop replaying","i keep going back to it",
  "same thoughts again","i dwell on it","i replay conversations",

  // Anxiety
  "what if","something bad will happen","i am scared","im scared",
  "i am worried","im worried","i feel panic","panic attack",
  "i cant relax","i feel unsafe","i feel nervous","im nervous",
  "im afraid","it might go wrong","im stressing",
  "worried about tomorrow","worried about future",
  "anticipating the worst","expecting bad news",
  "fearful","tense","uneasy","restless",
  "i feel dread","i feel anxious","i feel pressure",
  "i cant calm down","heart racing","i feel shaky","on edge",
  "scared of messing up","fear of failure","fear of rejection",
  "worried theyll leave","afraid of consequences",

  // Escape
  "want to disappear","wish i disappeared","vanish",
  "not exist","stop existing","hide forever",
  "run away from everything","become nothing",
  "erase myself","sleep forever","leave everything behind",
  "i want to fade away","i want to be gone",
  "i wish i was gone","i dont want to be here",
  "i want out","i want to escape","i want silence",
  "i want to hide","i want to vanish","i want to go away",
  "i want everything to stop","i want to shut down",
  "i want to retreat","i want to isolate",
  "i want to run away","i want to stop feeling",
  "i want numbness","i want nothingness",
  "i want to fade out","i want to hide forever",
  "im done","i am done","so done","i give up",
  "whats the point","what is the point","no point",
  "not okay","im not okay","i am not okay",

  // Crisis signals — these will also trigger the crisis note
  "kill myself","kms","want to die","want to be dead",
  "i want to die","i want to kill myself","im going to kill myself",
  "i am going to kill myself","end my life","end it all",
  "i want to end it","i dont want to live","dont want to live",
  "rather be dead","better off dead","better off without me",
  "everyone is better off without me","no reason to live",
  "i should die","i should be dead","i want to be dead",
  "murder myself","make it stop permanently","never wake up",
  "wish i never existed","wish i was never born","shouldnt have been born",
  "i want to hurt myself","hurt myself","cutting","self harm"
];

export const crisisPhrases = [
  "kill myself","kms","want to die","want to be dead",
  "i want to die","i want to kill myself","im going to kill myself",
  "i am going to kill myself","end my life","end it all",
  "i want to end it","i dont want to live","dont want to live",
  "rather be dead","better off dead","better off without me",
  "everyone is better off without me","no reason to live",
  "i should die","i should be dead","i want to be dead",
  "never wake up","wish i never existed","wish i was never born",
  "i want to hurt myself","hurt myself","cutting","self harm"
];

export function isCrisisDetected() {
  return state.crisisDetected;
}

export function recordKeystroke(key) {
  const now = Date.now();

  if (state.lastKeyTime && (now - state.lastKeyTime) > state.inactivityThreshold) {
    state.burstDetected = true;
  } else {
    state.burstDetected = false;
  }

  state.lastKeyTime = now;

  if (key === "Backspace") {
    state.backspaceCount++;
  }

  state.keyTimestamps.push(now);
  const cutoff = now - WINDOW_MS;
  state.keyTimestamps = state.keyTimestamps.filter(t => t > cutoff);
}

export function analyzeText(text) {
  const lower = text.toLowerCase();
  let totalCount = 0;
  const hitPhrases = new Set();

  for (const phrase of negativePhrases) {
    let idx = lower.indexOf(phrase);
    while (idx !== -1) {
      totalCount++;
      hitPhrases.add(phrase);
      idx = lower.indexOf(phrase, idx + 1);
    }
  }

  state.negativePhraseCounts = totalCount;
  state.uniqueNegativeHits = hitPhrases;
  state.repeatedHits = Math.max(0, totalCount - hitPhrases.size);

  // Check for crisis signals separately
  state.crisisDetected = crisisPhrases.some(phrase => lower.includes(phrase));
}

// 0-60 points — content is king
function getContentScore() {
  const unique = state.uniqueNegativeHits.size;
  if (unique >= 6) return 60;
  if (unique >= 4) return 48;
  if (unique >= 3) return 36;
  if (unique >= 2) return 24;
  if (unique >= 1) return 12;
  return 0;
}

// 0-20 points — repetition of same negative words = spiral signal
function getRepetitionScore() {
  if (state.repeatedHits >= 4) return 20;
  if (state.repeatedHits >= 2) return 12;
  if (state.repeatedHits >= 1) return 6;
  return 0;
}

// 0-10 points — sudden burst after silence
function getBurstScore() {
  return state.burstDetected ? 10 : 0;
}

// 0-10 points — backspace (reduced, minor signal)
function getBackspaceScore() {
  if (state.backspaceCount >= 20) return 10;
  if (state.backspaceCount >= 10) return 6;
  if (state.backspaceCount >= 5) return 3;
  return 0;
}

export function computeIntensityScore() {
  const score =
    getContentScore() +
    getRepetitionScore() +
    getBurstScore() +
    getBackspaceScore();

  return Math.min(score, 100);
}

export function resetWindow() {
  state.backspaceCount = 0;
  state.burstDetected = false;
}