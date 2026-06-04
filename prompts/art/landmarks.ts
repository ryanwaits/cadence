/**
 * Austin / Texas Hill Country / Southwest landmarks, each described as a subject
 * clause to drop into the luminist style. The recognizable landmark grounds the
 * fantasy; the `fantasy` dial then exaggerates the wilderness around it.
 */
export const LANDMARKS = {
  pennybacker: {
    name: "Pennybacker (360) Bridge",
    subject:
      "the graceful rust-red Pennybacker 360 steel arch bridge spanning a deep Hill Country river gorge, cedar-covered limestone cliffs rising on either side above a wide still river",
  },
  utTower: {
    name: "UT Tower",
    subject:
      "a tall pale limestone bell tower in the manner of the University of Texas tower crowning a forested hill, glowing in golden light above a valley",
  },
  capitol: {
    name: "Texas Capitol",
    subject:
      "a great domed sandstone capitol building in the manner of the Texas State Capitol, its pink-granite dome catching the light atop a broad rise of live oaks",
  },
  congress: {
    name: "Congress Ave Bridge",
    subject:
      "a long low arched stone bridge over a wide calm urban lake at dusk in the manner of the Congress Avenue bridge, a faint cloud of bats rising in the distance",
  },
  mountBonnell: {
    name: "Mount Bonnell",
    subject:
      "a high limestone overlook in the manner of Mount Bonnell above a winding emerald river far below, cedar and prickly-pear clinging to the rocky bluff",
  },
  enchantedRock: {
    name: "Enchanted Rock",
    subject:
      "an enormous rounded pink-granite dome in the manner of Enchanted Rock swelling from the Hill Country scrub, monumental and weathered",
  },
  hamiltonPool: {
    name: "Hamilton Pool",
    subject:
      "a collapsed-grotto jade-green grotto pool in the manner of Hamilton Pool, a thin waterfall spilling from a moss-hung limestone overhang into still water",
  },
  bartonSprings: {
    name: "Barton Springs",
    subject:
      "a long spring-fed natural pool of clear turquoise water in the manner of Barton Springs, lined with bald cypress and pecan, fed by limestone springs",
  },
} as const;

export type LandmarkKey = keyof typeof LANDMARKS;
