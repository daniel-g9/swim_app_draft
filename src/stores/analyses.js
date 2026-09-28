// Saved analyses, shared between the analysis screen (which adds to it) and
// the profile screen (which lists it). In-memory only, so it starts empty
// every time the app loads — swap for real storage once there is a backend.
import { reactive } from 'vue'

// Made-up coaching points per technique, standing in for what the analyser
// will return. Anything not listed falls back to DEFAULT_IMPROVEMENTS.
const IMPROVEMENTS = {
  Freestyle: ['Keep head neutral while breathing', 'Extend fully before the catch', 'Kick from the hips, not the knees'],
  Backstroke: ['Keep hips high in the water', 'Enter pinky-first', 'Hold a steady, still head'],
  Breaststroke: ['Glide longer after the kick', 'Keep elbows high on the pull', 'Snap the feet together'],
  Butterfly: ['Time the kick with hand entry', 'Breathe low and forward', 'Keep the arm recovery relaxed'],
  'Open turn': ['Touch with both hands together', 'Tuck knees in faster', 'Push off on your side'],
  'Flip turn': ['Start the flip closer to the wall', 'Keep the tuck tight', 'Streamline off the wall'],
  Dive: ['Drive harder off the back foot', 'Enter through one hole', 'Hold streamline before kicking'],
}

const DEFAULT_IMPROVEMENTS = ['Improve body position', 'Smooth out the timing', 'Hold a tighter streamline']

export const analyses = reactive([])

let nextId = 1

export function saveAnalysis({ title, technique }) {
  analyses.unshift({
    id: nextId++,
    title,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    technique,
    improvements: [...(IMPROVEMENTS[technique] ?? DEFAULT_IMPROVEMENTS)],
  })
}
