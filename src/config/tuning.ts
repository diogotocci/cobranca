// Every gameplay number lives here. Units are SI (meters, seconds, m/s) unless noted.
//
// World coordinates, shared by the simulation and the scene: the goal line is z = 0 with the
// goal centered on x = 0, the pitch extends toward +z where the kicker stands, x grows to the
// kicker's right, y is up. A shot travels toward -z.

export const fixedStep = 1 / 120;

export const pitch = {
  goalHalfWidth: 3.66,
  goalHeight: 2.44,
  gravity: 9.81,
} as const;

export const ball = {
  radius: 0.11,
  // Linear drag per second; a real ball loses roughly a quarter of its speed over 25 m.
  drag: 0.12,
  // Lateral acceleration in m/s^2 at full spin (spin = 1). A 20 m shot at full spin bows about
  // 1 m off its straight line at midflight, enough to bend around the wall.
  curlAcceleration: 14,
  // Extra downward acceleration from the topspin of a driven free kick. Without it a ball fast
  // enough to beat the keeper cannot rise over the wall and still drop under the bar.
  dip: 6,
  bounceRestitution: 0.55,
  groundFriction: 0.6,
} as const;

// Swipe lengths are measured in viewport heights so the same gesture feels the same on any screen.
export const swipe = {
  // A drag must start this close to the ball on screen. Generous: a fingertip covers the ball.
  grabRadius: 0.2,
  minLength: 0.06,
  fullPowerLength: 0.55,
  minSpeed: 14,
  maxSpeed: 32,
  // Launch angle above the ground, nearly constant so power alone decides the arc: too soft
  // hits the wall, too hard sails over the bar, and the right power depends on the distance.
  minElevation: 0.34,
  maxElevation: 0.38,
  // Radians of aim per radian of swipe angle; below 1 so small finger drift does not spray shots.
  aimGain: 0.45,
  // Sideways bulge of the gesture (as a fraction of its length) that gives full spin.
  fullSpinBulge: 0.22,
  // How much of the expected curl the launch direction pre-compensates, so a curled swipe still
  // lands near where the gesture points instead of curling far past it. Above 1 because drag
  // stretches the flight beyond the drag-free estimate.
  curlAimCompensation: 1.1,
} as const;

export const wall = {
  distance: 9.15,
  playerWidth: 0.5,
  height: 1.85,
  // The wall lines up between the ball and this point beside the near post.
  coverOffsetFromCenter: 2.2,
} as const;

// The keeper is the difficulty knob: a longer delay or a slower dive lets more corners in.
export const keeper = {
  lineZ: 0.6,
  standHeight: 1.0,
  // Radius around the keeper's body center that stops the ball (body plus outstretched arms).
  reach: 0.75,
  // Keeps the dive target this far inside the posts, bar and ground.
  frameMargin: 0.35,
  diveSpeed: 3.5,
  // Seconds after the kick before the keeper moves; the wall hides the ball until then.
  reactionDelay: 0.45,
  wrongGuessChance: 0.25,
} as const;

export const freeKick = {
  // Distance from the goal line; beyond 16.5 m keeps every spot outside the penalty area.
  minZ: 18,
  maxZ: 27,
  maxLateral: 10,
  // Walls get one player shorter beyond this distance from the goal center.
  shortWallDistance: 23,
  nearWallPlayers: 4,
  farWallPlayers: 3,
} as const;

// Frames longer than this (a background tab, a hitch) are cut short instead of fast-forwarded.
export const maxFrameTime = 0.25;

export const shot = {
  // A shot still unresolved after this many seconds is a miss.
  timeout: 4,
  // Seconds the result stays on screen before the next kick.
  resultHold: 1.6,
  // Fraction of speed the ball keeps when it hits the wall or the keeper.
  reboundRestitution: 0.3,
  // The back of the net, measured behind the goal line.
  netDepth: 1.6,
} as const;

export const round = {
  kicks: 5,
} as const;
