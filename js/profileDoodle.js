// Generate a pseudo-random number based on a string hash
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

// Generate a random number within a range based on a seed
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Map a number from one range to another
function mapRange(value, fromMin, fromMax, toMin, toMax) {
  return toMin + (value * (toMax - toMin)) / (fromMax - fromMin);
}

// Modify SVG based on username hash
function modifySvg(svgContent, hash) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'text/xml');

  // Modify turbulence filter based on username
  const turbulence = doc.querySelector('feTurbulence');
  if (turbulence) {
    // Generate consistent but unique values based on username hash
    const baseFreqX = mapRange(seededRandom(hash), 0, 1, 0.02, 0.08);
    const baseFreqY = mapRange(seededRandom(hash + 1), 0, 1, 0.02, 0.08);
    const numOctaves = 2 + Math.floor(seededRandom(hash + 2) * 4); // Range: 2-5

    turbulence.setAttribute(
      'baseFrequency',
      `${baseFreqX.toFixed(3)} ${baseFreqY.toFixed(3)}`
    );
    turbulence.setAttribute('numOctaves', numOctaves);
    turbulence.setAttribute('seed', Math.abs(hash));

    // Adjust the turbulence type based on hash
    turbulence.setAttribute(
      'type',
      seededRandom(hash + 3) > 0.5 ? 'fractalNoise' : 'turbulence'
    );
  }

  return new XMLSerializer().serializeToString(doc);
}

// Create and apply the doodle background
export async function applyDoodleBackground(username) {
  try {
    // Fetch the base SVG
    const response = await fetch('/assets/images/profile_background.svg');
    const baseSvg = await response.text();

    // Generate hash from username
    const hash = hashString(username);

    // Modify SVG based on username
    const modifiedSvg = modifySvg(baseSvg, hash);

    // Create blob and URL
    const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    // Apply as background
    document.body.style.backgroundImage = `url("${url}")`;

    // Clean up
    window.addEventListener('unload', () => URL.revokeObjectURL(url));
  } catch (error) {
    console.error('Error applying doodle background:', error);
  }
}
