# Scene Editor

A single-window 3D scene authoring tool built on an OpenGL 3.3 core renderer
with a dockable Dear ImGui UI. Sculpt a heightfield terrain, paint up to 16
texture layers, import glTF/VRM models as props, paint instanced vegetation,
snap together building blocks, place game cameras and character spawn markers
with a node-based logic graph, author procedural materials, simulate the scene
logic in-editor, and light everything under an imported HDR sky with dynamic
weather — then save it all as a single `.scene` file.

![OpenGL 3.3](https://img.shields.io/badge/OpenGL-3.3-core-blue)
![C++20](https://img.shields.io/badge/C%2B%2B-20-blue)
![CMake 3.20+](https://img.shields.io/badge/CMake-3.20%2B-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Terrain
- **Heightfield terrain** — 256×256 grid over a 200×200 world-space area with
  bilinear height sampling and ray-based mouse picking.
- **8 brush types** — Raise, Lower, Smooth, Flatten, Noise, Set Height,
  Texture (splat painting), and Vegetation.
- **3 falloff modes** — Smooth, Linear, and Constant brush falloff curves.
- **Framerate-independent strokes** — brush strength is scaled by frame time
  so sculpting behaves consistently regardless of FPS.
- **Texture layers** — up to 16 layers blended through 4 RGBA splat maps,
  each with an albedo + optional normal map and per-layer tile size.
- **Vertex editing** — in wireframe mode, select individual terrain vertices
  (Ctrl+click to add to the selection) and drag them with a gizmo in Free XYZ,
  Vertical, or Normal modes. The brush radius/falloff controls how neighbours
  follow the dragged centre for organic deformation.
- **Procedural noise generation** — Perlin, Simplex, Value, Worley, and Ridge
  noise with fractal Brownian motion (octaves, persistence, lacunarity), blend
  modes (Replace/Add/Subtract/Multiply/Min/Max), exponent shaping, invert, and
  a live preview thumbnail. Frequency is measured in cycles across the whole
  terrain, so the default settings are alias-free at the 256×256 grid.

### Props & Models
- **glTF 2.0 / VRM import** — parsed with cgltf over UTF-8 paths. Skinned
  meshes render in the bind (rest) pose; morph targets are parsed and applied
  at weight 0.
- **Prop placement** — drop imported models onto the terrain, auto-scaled to a
  target size. Ray-pick to select, then transform with a 3D gizmo.
- **Transform gizmo** — Translate, Rotate, and Scale modes with three coloured
  world axes (X=red, Y=green, Z=blue) and constant on-screen size.

### Vegetation
- **Instanced detail painting** — load glTF prototypes (grass, rocks, trees…)
  into a palette and paint instances onto the terrain with the Vegetation
  brush (Ctrl to erase). Hardware instancing keeps large counts cheap.
- **Auto-reproject** — instances and foundation blocks automatically follow
  the heightfield after terrain edits.
- **Wind sway** — vegetation bends with the weather wind (vertex shader,
  instanced path).

### Building
- **Snap-based blocks** — foundation blocks sink into the terrain; further
  blocks stack on top of or beside existing blocks via face snapping.
- **Foundation, wall & texture modes** — place single blocks, drag rectangles
  (foundations), drag lines (walls), or paint textures onto block faces.
- **Face textures** — load images into a shared texture library and assign
  them per block-face with Stretch or Tile UV modes.
- **Grid-snapped placement** with adjustable block size, sunk depth, and a
  rotatable wall edge (R cycles the 4 edges).

### Scene Cameras
- **Named game cameras** — id/name/tag, position + target, FOV and near/far
  planes. The id is the game's stable key and is never reused; the active
  camera is the game's initial camera.
- **Camera tool** — a pure cursor tool: click a camera's position, target, or
  frustum in the viewport to select it, empty click deselects.
- **Live previews** — the Camera View window renders a 256×144 thumbnail from
  a scene camera (round-robin, at most one preview rendered per frame), and
  selected cameras draw a 6 m frustum gizmo in the world.
- **Jump & cycle** — jump the editor camera to any scene camera pose; cycle
  cameras with `[` / `]`.

### Spawn Markers & Logic
- **Character spawn markers** — id/name/tag, position + yaw, optional glTF/VRM
  model (rendered in bind pose, +Z = facing, feet on the marker point), scale
  and default animation. Model-less markers are logic-only.
- **Node-based logic graph** — each marker owns a Root → Condition (true/false
  pins) → chained Actions graph, edited on a hand-rolled node canvas:
  - Conditions: Always, Flag compare (`==` `!=` `>` `<`), Random %, PlayerNear.
  - Actions: Spawn (with delay), Despawn, SetAnimation, CameraFocus (marker or
    scene camera), Wait, SetFlag, DialogLine, PlaySound.
- **Spawn tool** — click to pick, drag to move, Ctrl+click to place a marker.

### Simulation
- **In-editor play mode** — continuously re-resolves each marker's graph from
  the root and restarts changed action chains; timers honour Wait and Spawn
  delays; RandomChance latches per session; PlayerNear measures XZ distance to
  the camera target (the "player" proxy).
- **Live feedback** — spawned/despawned markers toggle model visibility,
  CameraFocus lerps the editor camera, the current animation floats above each
  marker, and an editable flag table + event log live in the Simulation panel.

### Weather
- **Presets + custom** — Clear, Overcast, Rain, Snow, Fog, or fully custom:
  precipitation type/intensity, fog color + exp² density, cloudiness, wind
  angle/strength, snow cover, and light scale.
- **GPU particles** — rain streaks / snow flakes in a 4096-particle box that
  wraps around the camera.
- **Scene-wide response** — fog and light scale feed every shader; snow cover
  whitens the terrain; wind sways painted vegetation.

### Procedural Materials
- **Node graphs** — Output, Image, SolidColor, Noise (all terrain noise
  types), Checker, Gradient, Mix, Multiply, Add, Brightness/Contrast, Invert,
  Grayscale, and HeightToNormal nodes on a multi-input canvas.
- **CPU bake, not shader codegen** — the graph is evaluated per pixel on the
  CPU and exported as a PNG (256/512/1024), which is then assigned to terrain
  layers or block face textures. Graphs persist in the `.scene` for editing.
- **Material Preview** — a separate window renders the baked texture on a lit
  UV sphere (drag to orbit) with a debounced live rebake.

### Environment & Scene
- **HDR skybox** — import an equirectangular panorama (.hdr/.png/.jpg/…) and
  convert it to a cubemap on the GPU (GL_RGB16F, exposure slider). Falls back
  to a procedural vertical-gradient sky.
- **Directional shadow maps** — PCF shadows for terrain, props, and blocks
  (toggleable), with front-face-culled depth pass.
- **Scene save/load** — single binary `.scene` file (magic + version + JSON
  metadata + heightfield + splat blobs) serializes terrain, layers, skybox,
  lighting, props, vegetation, blocks, scene cameras, spawn markers with their
  logic graphs, simulation flags, weather, and material graphs. Asset paths
  are stored relative to the scene file; every blob length is validated on
  load.

### Editor Shell
- **Docking UI** — the scene renders into an FBO shown in a dockable Viewport
  window; Toolbar, Tools, Hierarchy, and Inspector dock around it, and any
  window can be torn out into its own OS window (multi-viewport).
- **Undo/redo** — every edit (terrain strokes, prop/block edits, camera and
  spawn graph changes, material graph edits, …) is an undoable Command with a
  memory budget and drag-coalescing; the History panel shows the stack.
- **Orbit camera** — rotate (right-drag), pan (middle-drag), zoom (scroll),
  and move the orbit target with WASD.
- **Unit tests** — a doctest suite (`tests/`) covers the GL-free subsystems:
  noise, history/commands, scene cameras, spawn graphs, simulation, weather,
  and material baking.

## Controls

| Action | Input |
|---|---|
| Paint / place / pick (context: active tool) | Left-drag |
| Orbit camera | Right-drag |
| Pan camera | Middle-drag |
| Zoom | Scroll wheel |
| Move camera target | `W` `A` `S` `D` |
| Adjust brush radius | `Shift` + scroll |
| Adjust brush strength | `Ctrl` + scroll |
| Cycle tool (Brush→Prop→Vertex→Build→Camera→Spawn) | `Tab` |
| Select brush type | `1`–`8` |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` or `Ctrl+Shift+Z` |
| Cycle scene cameras | `[` / `]` |
| Toggle wireframe | `F` |
| Toggle help overlay | `H` |
| Prop gizmo: Translate / Rotate / Scale | `T` / `R` / `S` |
| Vertex drag mode: Free / Vertical / Normal | `V` / `B` / `N` |
| Build mode: Foundation / Wall / Texture | `Z` / `X` / `C` |
| Rotate wall edge | `R` |
| Place spawn marker / erase vegetation / add vertex to selection | `Ctrl` + click |
| Delete selected block | `Delete` |
| Quit | `Esc` |

Global hotkeys are suppressed while typing into text fields.

## Dependencies

All dependencies are fetched or vendored automatically by CMake — no manual
setup is required.

| Library | Version | Source |
|---|---|---|
| [GLFW](https://github.com/glfw/glfw) | 3.4 | CMake `FetchContent` |
| [GLM](https://github.com/g-truc/glm) | 1.0.3 | CMake `FetchContent` |
| [Dear ImGui](https://github.com/ocornut/imgui) | v1.92.5-**docking** | CMake `FetchContent` |
| [cgltf](https://github.com/jkuhlmann/cgltf) | v1.15 | CMake `FetchContent` |
| [stb](https://github.com/nothings/stb) | pinned commit (stb_image + stb_image_write) | CMake `FetchContent` |
| [nlohmann_json](https://github.com/nlohmann/json) | v3.11.3 | CMake `FetchContent` |
| [doctest](https://github.com/doctest/doctest) | v2.4.11 | CMake `FetchContent` (tests) |
| [GLAD](https://glad.dav1d.de/) | 2 (GL 3.3 core) | Vendored in `external/glad/` |

> An OpenGL 3.3+ capable GPU and driver are required. The ImGui **docking
> branch** tag is required (docking + multi-viewport are not in mainline 1.9x).

## Building

```bash
cmake -B build -S .
cmake --build build --config Release
```

The executable is output to `build/bin/scene_editor.exe`. CMake copies the
`shaders/` directory next to the binary as a post-build step — run the app
from `build/bin` so it finds them.

### Tests

```bash
cmake --build build --target tests --config Release
build/bin/tests.exe
```

### Command-line usage

```
scene_editor [--mateditor] [model_or_sky_or_scene ...]
```

Files passed on the command line are imported at startup, dispatching by
extension:

| Extension / flag | Action |
|---|---|
| `.gltf` `.glb` `.vrm` | Import as a model and spawn a prop at the camera target |
| `.hdr` `.png` `.jpg` `.jpeg` `.tga` `.bmp` | Import as the equirectangular skybox |
| `.scene` | Load a saved scene |
| `.savetest` | Save the current scene then reload it (round-trip smoke test) |
| `--mateditor` | Open the Materials / Material Editor / Material Preview windows and select the first material |

## Project Structure

```
.
├── CMakeLists.txt
├── external/
│   └── glad/                  # Vendored GLAD2 loader (GL 3.3 core)
├── shaders/
│   ├── terrain.vert/.frag     # Terrain (splat blending, fog, snow, shadows)
│   ├── line.vert/.frag        # Brush cursor, gizmos, wireframe, node editor
│   ├── prop.vert/.frag        # glTF props/vegetation (skinning, wind sway)
│   ├── block.vert/.frag       # Building blocks (face textures)
│   ├── skybox*.vert/.frag     # Skybox draw + equirect→cubemap conversion
│   ├── weather.vert/.frag     # Rain/snow particles
│   └── matpreview.vert/.frag  # Material Preview sphere
├── assets/                    # (gitignored) sample HDR sky & VRM model
├── tests/                     # doctest unit tests (GL-free subsystems)
└── src/
    ├── editor/
    │   ├── main.cpp               # Entry point
    │   ├── app.{cpp,h}            # Core loop, init/shutdown, input dispatch, render
    │   ├── tools.{cpp,h}          # ITool + Terrain/Prop/Vertex/Build/Camera/Spawn tools
    │   ├── app_ui.cpp             # Dockspace shell, viewport/toolbar windows, help
    │   ├── app_panels.cpp         # One draw*Content() per dock window
    │   ├── ui_icons.{cpp,h}       # ImDrawList vector icons
    │   └── ui_common.h            # Shared UI name helpers
    ├── scene/                     # Subsystems (no UI knowledge)
    │   ├── terrain.{cpp,h}        # Heightfield, brushes, splat layers
    │   ├── model.{cpp,h}          # glTF/VRM loader (cgltf), skinning
    │   ├── prop.{cpp,h}           # Placed prop instances + selection
    │   ├── detail.{cpp,h}         # Instanced vegetation system
    │   ├── build.{cpp,h}          # Snap-based block building + face textures
    │   ├── scene_camera.{cpp,h}   # SceneCamera (id/name/tag/pose/fov) + CameraRig
    │   ├── spawn.{cpp,h}          # Spawn markers + condition/action logic graph
    │   ├── sim.{cpp,h}            # SimController: in-editor logic simulation
    │   ├── weather.{h,cpp}        # WeatherParams + presets, rain/snow particles
    │   ├── material_graph.{cpp,h} # Procedural material nodes + CPU bake/PNG
    │   ├── skybox.{cpp,h}         # Cubemap skybox + HDR equirect import
    │   ├── gizmo.{cpp,h}          # Translate/Rotate/Scale manipulator
    │   ├── vertex_edit.{cpp,h}    # Vertex-level terrain editing gizmo
    │   ├── brush.{cpp,h}          # Brush cursor ring rendering
    │   ├── scene.{cpp,h}          # App::saveScene/loadScene + format spec comment
    │   ├── scene_io.{cpp,h}       # Free save/load functions over SceneContext refs
    │   ├── history.{cpp,h}        # Undo stack: Command base, memory budget, merge
    │   └── commands.{cpp,h}       # Concrete undoable edits
    └── platform/                  # Foundation (zero editor dependencies)
        ├── camera.{cpp,h}         # Orbit camera with ray casting
        ├── input.{cpp,h}          # Centralized GLFW input state
        ├── shader.{cpp,h}         # Shader loading + cached uniform locations
        ├── gl_resource.h          # Move-only RAII GL wrappers
        ├── sys_util.{cpp,h}       # UTF-8 file IO (wide Win32 APIs on Windows)
        ├── file_dialog.{cpp,h}    # Native open/save file dialogs (Win32, UTF-8)
        ├── noise.h                # Header-only procedural noise (Perlin/Simplex/…)
        ├── stb_image_impl.cpp     # stb_image implementation unit
        └── stb_image_write_impl.cpp # stb_image_write implementation unit
```

## Architecture Notes

- **Layered** — `platform/` knows nothing about the editor, `scene/` knows
  nothing about ImGui, and `editor/` wires subsystems to tools and docked
  panels. `App` is a single class split across `app.cpp`, `app_ui.cpp`,
  `app_panels.cpp`, and `scene.cpp`.
- **Frame flow** — input dispatch (hotkeys → camera → active tool) → world
  render into the Viewport FBO (shadow depth pass → skybox → terrain → props
  → vegetation → blocks → weather particles → editor overlays) → one
  round-robin scene-camera preview → docked ImGui windows + platform windows.
- **Undo** — tools mutate the scene first, then push a `Command` holding
  before/after data; one command per stroke/drag, with `merge()` coalescing
  slider drags. Ids (props, blocks, cameras, spawns, materials, graph nodes)
  are never reused, so undo restores objects with their original ids instead
  of capturing dangling pointers.
- **Scene cameras & spawns & materials are game data** — the `.scene` JSON is
  the contract with the game: cameras keyed by id, spawn logic graphs, initial
  flag values, weather, and material graphs (whose bakes are plain PNGs the
  game loads as ordinary textures).
- **Input gating with docking** — `io.WantCaptureMouse` is true over every
  docked window (including the Viewport), so tool input gates on the app's
  `overUI` flag (mouse over UI but not the viewport image), and global hotkeys
  gate on `!io.WantTextInput`.
- **Input** is centralized in a single `Input` singleton fed by GLFW callbacks
  and polled each frame, accumulating mouse deltas so fast motion isn't lost.
- **Terrain** stores heights in a flat array and uploads vertices to a
  persistent VBO/EBO (buffer orphaning on edit). Brush edits recompute normals
  incrementally over the edited bounding box. Splat maps are kept as CPU
  pixels and re-uploaded on edit.
- **Picking** unprojects the cursor (viewport-rect aware) to a world-space ray
  and intersects it with the heightfield for painting, vegetation, and block
  placement; props use an AABB slab test; cameras and spawn markers are picked
  by ray-vs-gizmo-geometry, sharing the exact visualization geometry.
- **Models** share a `Model` library so a loaded glTF stays alive while
  referenced by props, vegetation prototypes, and spawn markers, and renders
  either standalone or hardware-instanced via a per-instance mat4 VBO.
- **File IO** accepts UTF-8 paths everywhere via `sys_util` (wide Win32 APIs)
  or custom cgltf file callbacks; `.scene` loading validates every blob length
  against the buffer before use.

## License

Licensed under the [MIT License](./LICENSE.md) — see the `LICENSE.md` file for
details. Third-party dependencies retain their own licenses (GLFW, GLM, Dear
ImGui, cgltf, stb, nlohmann_json, doctest, GLAD).
