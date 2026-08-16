/**
 * The site's sound palette — fifteen recipes chosen from the reference packs
 * of m1ckc3s/procedural-sounds ("sonaut", MIT; reference packs MIT, (c)
 * Raphael Salaja). Every sound is synthesized live by `player.ts` from the
 * JSON below — there are no audio files.
 *
 * Selection taste: the constant sounds (taps, hovers, toggles) come from the
 * `minimal` pack and the feedback sounds (send/success/error, page turns)
 * from `soft` — the two quietest voices in the library — with `core` only
 * for the drawer and the /work ring's detents. Gains ship as curated
 * upstream (0.04–0.18); `sfx.ts` applies the per-category trims on top.
 * Do not "improve" a recipe by ear in code review — they are curated as a
 * set, and a louder one sticks out of it.
 */

export type SoundName =
  | 'tap'
  | 'hover'
  | 'keyPress'
  | 'checkbox'
  | 'toggleOn'
  | 'toggleOff'
  | 'pageExit'
  | 'pageEnter'
  | 'drawerOpen'
  | 'drawerClose'
  | 'send'
  | 'success'
  | 'error'
  | 'tick'
  | 'scrollSnap';

// Recipes are data with a stringly-typed schema owned by the vendored player.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SOUNDS: Record<SoundName, any> = {
  "tap": {
    "source": {
      "type": "sine",
      "frequency": 1200
    },
    "envelope": {
      "attack": 0,
      "decay": 0.012,
      "sustain": 0,
      "release": 0.004
    },
    "gain": 0.08
  },
  "hover": {
    "source": {
      "type": "sine",
      "frequency": 1300
    },
    "envelope": {
      "attack": 0,
      "decay": 0.01,
      "sustain": 0,
      "release": 0.004
    },
    "gain": 0.04
  },
  "keyPress": {
    "source": {
      "type": "sine",
      "frequency": 1100
    },
    "envelope": {
      "attack": 0,
      "decay": 0.01,
      "sustain": 0,
      "release": 0.003
    },
    "gain": 0.06
  },
  "checkbox": {
    "source": {
      "type": "sine",
      "frequency": 1000
    },
    "envelope": {
      "attack": 0,
      "decay": 0.018,
      "sustain": 0,
      "release": 0.005
    },
    "gain": 0.09
  },
  "toggleOn": {
    "layers": [
      {
        "source": {
          "type": "sine",
          "frequency": 880
        },
        "envelope": {
          "attack": 0,
          "decay": 0.02,
          "sustain": 0,
          "release": 0.006
        },
        "gain": 0.08
      },
      {
        "source": {
          "type": "sine",
          "frequency": 1320
        },
        "envelope": {
          "attack": 0,
          "decay": 0.02,
          "sustain": 0,
          "release": 0.006
        },
        "delay": 0.03,
        "gain": 0.07
      }
    ]
  },
  "toggleOff": {
    "layers": [
      {
        "source": {
          "type": "sine",
          "frequency": 1320
        },
        "envelope": {
          "attack": 0,
          "decay": 0.02,
          "sustain": 0,
          "release": 0.006
        },
        "gain": 0.08
      },
      {
        "source": {
          "type": "sine",
          "frequency": 880
        },
        "envelope": {
          "attack": 0,
          "decay": 0.02,
          "sustain": 0,
          "release": 0.006
        },
        "delay": 0.03,
        "gain": 0.07
      }
    ]
  },
  "pageExit": {
    "source": {
      "type": "triangle",
      "frequency": {
        "start": 550,
        "end": 350
      }
    },
    "envelope": {
      "attack": 0.008,
      "decay": 0.18,
      "sustain": 0,
      "release": 0.07
    },
    "gain": 0.07
  },
  "pageEnter": {
    "source": {
      "type": "triangle",
      "frequency": {
        "start": 350,
        "end": 550
      }
    },
    "envelope": {
      "attack": 0.01,
      "decay": 0.2,
      "sustain": 0,
      "release": 0.08
    },
    "gain": 0.08
  },
  "drawerOpen": {
    "source": {
      "type": "sine",
      "frequency": {
        "start": 350,
        "end": 1000
      }
    },
    "envelope": {
      "attack": 0,
      "decay": 0.1,
      "sustain": 0,
      "release": 0.03
    },
    "gain": 0.08
  },
  "drawerClose": {
    "source": {
      "type": "sine",
      "frequency": {
        "start": 800,
        "end": 350
      }
    },
    "envelope": {
      "attack": 0,
      "decay": 0.1,
      "sustain": 0,
      "release": 0.03
    },
    "gain": 0.06
  },
  "send": {
    "source": {
      "type": "triangle",
      "frequency": {
        "start": 400,
        "end": 800
      }
    },
    "envelope": {
      "attack": 0.005,
      "decay": 0.15,
      "sustain": 0,
      "release": 0.06
    },
    "gain": 0.13
  },
  "success": {
    "layers": [
      {
        "source": {
          "type": "triangle",
          "frequency": 523
        },
        "envelope": {
          "attack": 0.008,
          "decay": 0.25,
          "sustain": 0.04,
          "release": 0.1
        },
        "gain": 0.14
      },
      {
        "source": {
          "type": "triangle",
          "frequency": 659
        },
        "envelope": {
          "attack": 0.008,
          "decay": 0.22,
          "sustain": 0.03,
          "release": 0.1
        },
        "delay": 0.1,
        "gain": 0.12
      },
      {
        "source": {
          "type": "triangle",
          "frequency": 784
        },
        "envelope": {
          "attack": 0.008,
          "decay": 0.2,
          "sustain": 0.03,
          "release": 0.1
        },
        "delay": 0.2,
        "gain": 0.1
      }
    ]
  },
  "error": {
    "layers": [
      {
        "source": {
          "type": "triangle",
          "frequency": 300
        },
        "envelope": {
          "attack": 0.005,
          "decay": 0.2,
          "sustain": 0,
          "release": 0.08
        },
        "gain": 0.18
      },
      {
        "source": {
          "type": "triangle",
          "frequency": 280
        },
        "envelope": {
          "attack": 0.005,
          "decay": 0.18,
          "sustain": 0,
          "release": 0.07
        },
        "delay": 0.015,
        "gain": 0.14
      }
    ]
  },
  "tick": {
    "source": {
      "type": "sine",
      "frequency": 1500,
      "fm": {
        "ratio": 0.5,
        "depth": 60
      }
    },
    "envelope": {
      "attack": 0,
      "decay": 0.01,
      "sustain": 0,
      "release": 0.004
    },
    "gain": 0.15
  },
  "scrollSnap": {
    "source": {
      "type": "sine",
      "frequency": 1400,
      "fm": {
        "ratio": 0.5,
        "depth": 50
      }
    },
    "envelope": {
      "attack": 0,
      "decay": 0.008,
      "sustain": 0,
      "release": 0.003
    },
    "gain": 0.08
  }
};
