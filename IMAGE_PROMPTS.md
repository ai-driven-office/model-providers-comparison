# Booth Slideshow — Image Slide Prompts

Cinematic interstitial images for the booth slideshow on a 40" LG curved ultrawide monitor (2560x1080).
Each image sits between data slides as a visual "breather" — evoking quality, innovation, and the feeling of being at the frontier of AI.

## Specifications

- **Aspect ratio**: `21:9` (ultrawide, matching 2560x1080)
- **Resolution**: `2560 x 1080 px` (export at 2x = `5120 x 2160 px` for retina sharpness)
- **Style**: Hyper-realistic professional photography. Dark, moody, editorial. Deep blacks, selective lighting, shallow depth of field. Color palette anchored to AID brand: electric blue `#3370FE`, violet `#8A3CB8`, magenta `#E0247A`, red `#FF0413` as accent lighting against deep charcoal/black environments.
- **Mood**: Calm authority. Precision. The feeling of standing at the edge of something immense.
- **Text overlay**: None in the generated image. Text/logos will be composited in code.
- **Format**: PNG (lossless) or high-quality WebP
- **File location**: `public/booth/` directory

---

## Slide 0 — `booth_hero.webp`

> Placed BEFORE the title slide. First thing people see.

**Prompt:**

A dramatic wide-angle photograph of a vast server room corridor stretching into infinity, shot from a low angle at floor level. Rows of glass-paneled server racks on both sides emit a cold electric blue glow (#3370FE) that reflects off the polished black floor like a mirror. Volumetric light beams cut through a faint haze in the air. The far end of the corridor dissolves into a brilliant white-blue light source — suggesting something powerful awakening beyond. Ultra-sharp foreground with gradually increasing atmospheric haze toward the vanishing point. No people. The silence is palpable. Shot on a Phase One IQ4 150MP, 24mm f/2.8, long exposure. Cinematic color grading with crushed blacks and lifted highlights in the blue channel. 21:9 ultrawide aspect ratio.

---

## Slide 2 — `booth_speed.webp`

> Placed BETWEEN title and throughput chart. Evokes velocity, acceleration, raw speed.

**Prompt:**

A macro photograph of fiber optic cables in motion, captured with a 1/8000s shutter speed. Dozens of glass fiber strands are arranged in a sweeping arc from left to right across the frame, each carrying pulsing light — electric blue (#3370FE) transitioning to cyan and white at their brightest points. The background is pure black. Individual photons are frozen mid-transit as luminous pinpoints within the glass. Shallow depth of field isolates a single strand in razor-sharp focus while the others dissolve into soft bokeh streams of light. Water-like caustic reflections dance on the dark surface below. Shot on Sony A1, 90mm f/2.8 Macro, focus stacking. Studio lighting. 21:9 ultrawide aspect ratio.

---

## Slide 4 — `booth_cost.webp`

> Placed BETWEEN throughput and pricing. Evokes precision, economy, value engineering.

**Prompt:**

An overhead flat-lay photograph of a single precision-machined titanium component resting on a sheet of black graph paper. The component is a perfect geometric form — a small cube with micro-perforated surfaces and chamfered edges — catching light from a single overhead source that creates hard shadows and brilliant specular highlights along its edges. The graph paper grid is barely visible, printed in dark grey. A few scattered micro-components (tiny capacitors, gold connector pins) are arranged with surgical precision nearby. The color temperature is cool and neutral with the faintest hint of magenta (#E0247A) in the metallic reflections. Everything communicates extreme precision at minimal scale. Shot on Hasselblad X2D, 120mm f/3.5 Macro, tethered to Capture One. Focus stacked. 21:9 ultrawide aspect ratio.

---

## Slide 6 — `booth_intelligence.webp`

> Placed BETWEEN pricing and abilities radar. Evokes cognitive depth, neural complexity, intelligence.

**Prompt:**

A close-up photograph of a human eye, iris filling 60% of the frame, shot in extreme macro. The iris is a deep amber-brown with intricate radial fiber patterns visible at cellular resolution. Reflected in the glossy cornea surface is a softly glowing grid of data — blue (#3370FE) and violet (#8A3CB8) light patterns forming a subtle neural network visualization. The pupil is dilated, deep black, pulling the viewer in. The surrounding skin is lit by cool ambient light with the faintest blue rim light along the eyelashes. Hyper-detailed — every eyelash strand, every micro-texture of the iris is resolved. Shot on Canon EOS R5, MP-E 65mm f/2.8 1-5x Macro, ring flash with blue gel. Clinical sharpness. 21:9 ultrawide aspect ratio.

---

## Slide 8 — `booth_analysis.webp`

> Placed BETWEEN abilities radar and scatter plot. Evokes analytical thinking, spatial reasoning, mapping.

**Prompt:**

An aerial photograph looking straight down at a city at night from 500 meters altitude. The streets form an organic grid pattern — not a perfect grid, but the slightly irregular blocks of Tokyo's Shibuya ward. Street lights trace warm amber lines while building interiors glow in scattered blues and whites. Major intersections bloom with brighter light. The overall impression is of a living data visualization — a scatter plot made of light and urban geometry. Thin clouds partially veil the lower-right corner, adding atmospheric depth. The dominant color is deep indigo-black sky with warm sodium-orange streets and cool blue-white building light. No visible horizon. Shot from helicopter, Phase One IQ4, 55mm f/4, 2-second exposure with gyro stabilization. 21:9 ultrawide aspect ratio.

---

## Slide 10 — `booth_models.webp`

> Placed BETWEEN scatter plot and model cards. Evokes diversity, collection, a lineup of contenders.

**Prompt:**

A studio photograph of seven different precision wristwatches arranged in a gentle arc on a slab of raw black obsidian stone. Each watch represents a different design philosophy — one minimalist Bauhaus, one complex chronograph, one digital, one skeleton showing movement, one dive watch, one dress watch, one smart watch. They are evenly spaced with mathematical precision. Each watch face catches light differently — some show blue (#3370FE) lume, others warm gold indices. A single overhead softbox creates a controlled pool of light that falls off to pure black at the edges. The obsidian surface shows subtle volcanic glass reflections. Every dial detail, every brushed-steel surface, every sapphire crystal is resolved in perfect clarity. Shot on Fujifilm GFX 100S, 110mm f/2, tethered. 21:9 ultrawide aspect ratio.

---

## Slide 12 — `booth_future.webp`

> Placed BETWEEN model cards and closing. Evokes forward momentum, invitation, openness to what's next.

**Prompt:**

A landscape photograph taken from inside a dark concrete tunnel looking outward toward a brilliant sunrise over the ocean. The tunnel frame creates a perfect wide rectangle matching the 21:9 aspect ratio, its raw concrete walls textured with geometric formwork patterns. The ocean beyond is calm, reflecting the sky's gradient from deep violet (#8A3CB8) at the top through magenta (#E0247A) and warm amber to a white-hot sun just breaking the horizon line. Light rays stream into the tunnel, casting long soft shadows. The concrete floor is wet, creating a mirror-like reflection of the sunrise. A single person's silhouette stands at the tunnel exit, small in the frame, looking outward — representing the viewer stepping toward the future. Shot on Nikon Z9, 20mm f/1.8, natural light, golden hour. 21:9 ultrawide aspect ratio.

---

## Integration Plan

### File structure

```
public/booth/
  booth_hero.webp          # 0 — Opening (before title)
  booth_speed.webp         # 2 — Before throughput
  booth_cost.webp          # 4 — Before pricing
  booth_intelligence.webp  # 6 — Before abilities
  booth_analysis.webp      # 8 — Before scatter
  booth_models.webp        # 10 — Before model cards
  booth_future.webp        # 12 — Before closing
```

### New slide order (14 slides total)

| Index | Type  | Content               | File / Component        |
|-------|-------|-----------------------|-------------------------|
| 0     | IMAGE | Opening cinematic     | `booth_hero.webp`       |
| 1     | DATA  | Title (AIモデル比較)    | `<SlideTitle />`        |
| 2     | IMAGE | Speed transition      | `booth_speed.webp`      |
| 3     | DATA  | Throughput chart      | `<SlideThroughput />`   |
| 4     | IMAGE | Cost transition       | `booth_cost.webp`       |
| 5     | DATA  | Pricing chart         | `<SlidePricing />`      |
| 6     | IMAGE | Intelligence          | `booth_intelligence.webp` |
| 7     | DATA  | Abilities radar       | `<SlideAbilities />`    |
| 8     | IMAGE | Analysis / cityscape  | `booth_analysis.webp`   |
| 9     | DATA  | Scatter plot          | `<SlideScatter />`      |
| 10    | IMAGE | Models / collection   | `booth_models.webp`     |
| 11    | DATA  | Model cards           | `<SlideModelCards />`   |
| 12    | IMAGE | Future / horizon      | `booth_future.webp`     |
| 13    | DATA  | Closing (CTA)         | `<SlideClosing />`      |

### `TOTAL_SLIDES` update

Change from `7` to `14` in `BoothSlideshow.tsx`.

### Image slide component

```tsx
function SlideImage({ src }: { src: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden" }}>
      <img
        src={`${base}booth/${src}`}
        alt=""
        style={{
          width: W,
          height: H,
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />
      {/* Subtle dark vignette overlay for brand consistency */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at center, transparent 40%, ${BG}cc 100%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}
```

### Updated slides array

```tsx
const slides = [
  <SlideImage key="img-hero" src="booth_hero.webp" />,
  <SlideTitle key="title" />,
  <SlideImage key="img-speed" src="booth_speed.webp" />,
  <SlideThroughput key="throughput" models={models} colorMap={colorMap} />,
  <SlideImage key="img-cost" src="booth_cost.webp" />,
  <SlidePricing key="pricing" models={models} colorMap={colorMap} />,
  <SlideImage key="img-intelligence" src="booth_intelligence.webp" />,
  <SlideAbilities key="abilities" models={models} colorMap={colorMap} />,
  <SlideImage key="img-analysis" src="booth_analysis.webp" />,
  <SlideScatter key="scatter" models={models} colorMap={colorMap} />,
  <SlideImage key="img-models" src="booth_models.webp" />,
  <SlideModelCards key="cards" models={models} colorMap={colorMap} />,
  <SlideImage key="img-future" src="booth_future.webp" />,
  <SlideClosing key="closing" />,
];
```

### Timing consideration

With 14 slides at 12 seconds each = **2 minutes 48 seconds** per full loop. Image slides could optionally run shorter (8 seconds) for a punchier rhythm:

```tsx
const SLIDE_DURATION_DATA = 12_000;
const SLIDE_DURATION_IMAGE = 8_000;
```

This would give **2 minutes 20 seconds** per loop — a good cadence for booth foot traffic.
