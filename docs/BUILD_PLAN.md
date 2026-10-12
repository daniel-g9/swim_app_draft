# Swim Technique App — Collaborative Build Plan

Dated 2026-10-12. This is the plan of record. Source: "Swim Technique App — Collaborative Build Plan.pdf". Open issues found on review are listed at the end.

## Overview

48 tasks across 8 stages: 12 are YOU (Yan), 36 are CLAUDE. YOU tasks are the parts Claude physically can't do (film, click, hold accounts, test on a phone, press Submit); each is scoped to a few hours with an exact command or checklist. By effort the split is closer to 85/15 in Claude's favor.

**Scope:** technique analysis only — limb angles, stroke rhythm, symmetry, breathing, fatigue drift. No splits, no timing. v1 is freestyle, one lane, one phone camera from the stands; the data model accepts a second camera from day one.

**Key decision:** v1 uses pretrained pose models with no fine-tuning. Stage 3 fine-tunes only if the Stage 2 evaluation says it must. Labeling stays optional.

**What Yan sends to start:** two race clips, phone model, and the Vue repo. That unblocks Stages 0 and 1.

## Shared conventions (read first)

- **Repos.** Two repos: `swimtech-api` (Python: pipeline + FastAPI) and this Vue repo (the app). Folder layout for `swimtech-api` proposed in 1.1; the Vue repo keeps its structure.
- **Python.** 3.11, `uv` for environments, `ruff` for lint, `pytest` for tests. Every pipeline stage is a pure function `stage(input) -> output`, no global state.
- **Video.** All processing runs on a normalized file: H.264, 8-bit, constant 60 fps (or source rate if lower), rotation baked in, named `<race_id>.norm.mp4`. Nothing downstream reads the original phone file.
- **Keypoints.** 13 points, in this order: nose, L ear, R ear, L shoulder, R shoulder, L elbow, R elbow, L wrist, R wrist, L hip, R hip, L knee, R knee. (Ankles added later if a side camera arrives.) Each has `(x, y, conf, vis)`; `vis` is 0 not in frame, 1 occluded, 2 visible. Pixel coordinates are in the normalized video's frame, never the crop.
- **Time.** Frame index is the primary key; seconds = `frame / fps`. Cycles numbered per arm from 1 at the first detected entry.
- **Results JSON** (one per race, `<race_id>.results.json`, the API ↔ Vue contract):

```json
{
  "race_id": "...", "fps": 60, "n_frames": 3480, "stroke": "free",
  "keypoints": "<race_id>.kp.parquet",
  "cycles": [{"arm": "L", "n": 1, "entry_f": 120, "exit_f": 171, "length": 1}],
  "metrics": [{"cycle": "L1", "name": "elbow_angle_exit", "value": 118.4, "unit": "deg", "vis": 0.92}],
  "findings": [{"frame": 1830, "severity": "med", "text": "Right elbow angle at exit fell 14 deg from length 1 to 4"}],
  "media": {"annotated": "<race_id>.annot.mp4", "thumb": "<race_id>.jpg"}
}
```

  Per-frame keypoints live in a Parquet sidecar; everything else is in the JSON. The Vue app never computes metrics; it only displays them.
- **Confidence.** Every metric carries `vis`, the mean visibility of the keypoints it used (0–1). The UI greys out anything under 0.6. No metric is reported without it.
- **Angles.** Interior angle at the middle joint, degrees, from 2D image coordinates unless the metric name ends in `_rect` (after lane-plane rectification). Reported as absolute values and as deltas from the swimmer's baseline; the UI leads with the delta.
- **Licenses.** Permissive only in anything shipped: RF-DETR, ByteTrack, MMPose/RTMPose, SAM 2, MotionBERT, FastAPI, ONNX Runtime, Capacitor. No AGPL (Ultralytics), no non-commercial (VideoPose3D).
- **Secrets.** Never in code. `.env` locally, Modal/Supabase secret stores in production. Claude templates every `.env`; Yan fills it.

## Stage 0 — Spec and footage

Goal: a written metric spec both agree on, and real footage from Yan's phone. Nothing in Stage 1 starts without the clips.

### 0.1 [CLAUDE] Metric spec
- Depends on: nothing
- Purpose: turn "angles of limbs" into exact formulas over the 13 keypoints.
- Actions: write `docs/metrics.md`, one entry per metric: name, keypoints used, formula, cycle instant sampled (entry / mid-recovery / exit / breath), unit, image-space or `_rect`. v1 list: elbow angle at exit, mid-recovery and entry (L/R); wrist height above shoulder line at mid-recovery (L/R); hand entry offset from shoulder line (`_rect`, L/R); forearm entry angle (L/R); head angle vs shoulder line; head lift on breath; shoulder-line angle and foreshortening per cycle (roll proxy); hip–shoulder lateral offset (`_rect`); breath side, frequency and cycle-length penalty; stroke rate and cycle CV.
- Output: `docs/metrics.md` plus `swimtech/metrics/registry.py` mapping each name to a function stub.
- Teaching notes: angle at joint B from A, B, C is `degrees(acos(dot(A−B, C−B) / (|A−B||C−B|)))`. "At exit" means the frame where the wrist's vertical velocity changes sign from down to up near the hip; cycle segmentation (2.3) gives those frames. Separating what is measured from when it is sampled makes metrics reusable across strokes.

### 0.2 [YOU] Spec sign-off
- Depends on: 0.1
- Actions: read `docs/metrics.md`; add, remove or rename metrics; mark the five you care about most.
- Output: approved `docs/metrics.md`. ~30 min.

### 0.3 [YOU] Film and send clips
- Depends on: nothing (parallel with 0.1)
- Actions: at one meet, record 5–10 races. Tripod + phone clamp; telephoto lens (3x or 5x) if available, never pinch-zoom; 4K 60 fps; HDR and stabilization off; long-press to lock focus/exposure on a swimmer in the target lane before the start; shutter 1/500 s or faster if the camera app allows (Blackmagic Camera, free, does); clip-on circular polarizer if you have one. Frame one or two lanes so a swimmer is 500–900 px tall. Record a 5-second empty-lane clip from the same tripod position for calibration.
- Output: 2 clips (one freestyle, one anything else) via any file link, plus phone model, lens used, lane of interest. ~2 h including setup.
- Notes: if the pool has windows, sit with the windows behind you. A 1-minute 4K60 clip is ~400 MB.

### 0.4 [YOU] Repo handoff
- Depends on: nothing
- Actions: share the Vue repo, or folder tree + one representative component + `package.json` + router + screenshots of each screen.
- Output: repo access. ~20 min. **Done: this repo.**

## Stage 1 — Ingest and swimmer localization

Goal: any phone clip becomes a normalized video plus a stable per-frame crop of the swimmer in the chosen lane.

### 1.1 [CLAUDE] Repo scaffold and ingest tool
- Depends on: 0.3
- Actions: create `swimtech-api` with `swimtech/` (pipeline), `api/` (FastAPI), `scripts/`, `tests/`, `docs/`. `swimtech/ingest.py`: probe with `ffprobe`, bake rotation, constant frame rate, re-encode H.264 8-bit, write `<race_id>.norm.mp4` and `<race_id>.probe.json`. CLI: `uv run swimtech ingest IMG_1234.MOV --race-id meet1_r3`.
- Output: normalized video + probe JSON (fps, duration, resolution, codec, detected VFR).
- Teaching notes: phones record variable frame rate; `ffmpeg -vsync cfr -r 60` resamples to fixed rate. iPhones write HEVC 10-bit with a rotation tag; autorotate bakes it in. Always `-pix_fmt yuv420p`.

### 1.2 [CLAUDE] Clip quality check
- Depends on: 1.1
- Actions: `swimtech/quality.py`: sample 20 frames; Laplacian-variance sharpness, mean brightness, clipped-highlight fraction (glare), inter-frame border motion (shake). Thresholds in config; output a score and up to three human-readable warnings.
- Output: `quality` block in the probe JSON.
- Teaching notes: Laplacian variance under ~100 on 4K usually means blur or missed focus. Border motion via `cv2.phaseCorrelate` on the top strip; over ~2 px/frame means the tripod moved.

### 1.3 [CLAUDE] Swimmer detector
- Depends on: 1.1
- Actions: `swimtech/detect.py` wrapping RF-DETR (Apache 2.0) pretrained on COCO `person`; run at 15 fps on a downscaled frame, interpolate boxes between runs; export to ONNX. If recall is poor, add a 200-frame fine-tune later (3.2 produces labels).
- Output: `<race_id>.det.parquet` — frame, box, score.
- Teaching notes: COCO detectors see few half-submerged people; recall drops on underwater phases, which surface technique doesn't need. 15 fps + interpolation is 4x cheaper and loses nothing because the crop has margin.

### 1.4 [CLAUDE] Lane tracker and crop
- Depends on: 1.3
- Actions: `swimtech/track.py` with ByteTrack; user picks a lane (box on first frame from Vue, or lane number + calibration clip); keep only the track in that lane; fill gaps up to 1 s by linear interpolation; smooth box center with a 15-frame moving average; fix crop size to 95th-percentile box height × 1.6. Write `<race_id>.crop.mp4` at 60 fps and per-frame crop offsets.
- Output: crop video + `<race_id>.crop.parquet` (frame, x0, y0, w, h).
- Teaching notes: ByteTrack's second low-confidence association pass survives splash. The lane constraint makes ID swaps nearly impossible. A fixed crop size matters: pose models are sensitive to scale jitter.

### 1.5 [CLAUDE] Lane-plane calibration
- Depends on: 1.1
- Actions: `swimtech/calib.py`: from the empty-lane clip, user clicks the four lane corners in the Vue app; compute a homography to a top-down lane frame in meters (lane width 2.5 m default, 2.13 m for 7 ft; pool length 25 yd default). Store `<race_id>.calib.json`.
- Output: calibration JSON; `to_rect(x, y)`.
- Teaching notes: `cv2.findHomography` on four correspondences. Only near-surface keypoints (shoulders, hips, wrist at entry) get rectified; recovery arm stays in image space.

### 1.6 [YOU] Run Stage 1 on one clip
- Depends on: 1.4
- Actions: `git clone`, `uv sync`, `uv run swimtech run --to track clip.MOV --race-id test1 --lane 4`. Open `test1.crop.mp4`. Report: does it stay on the swimmer? where does it jump? Paste the console log.
- Output: notes and log. ~30 min; laptop CPU is fine.
- Notes: Claude provides `setup.md` for Mac/Windows/Linux. If install fails, paste the error and stop.

## Stage 2 — Pose, metrics and the API service

Goal: crop → full results JSON + annotated video, served by an API. The core of the product.

### 2.1 [CLAUDE] Pose inference
- Depends on: 1.4
- Actions: `swimtech/pose.py` running RTMPose-l (MMPose, Apache 2.0) on each crop frame at 60 fps; map COCO-17 to the 13-point set; convert crop → normalized-frame coordinates; export ONNX. Fallback behind a flag: ViTPose-B.
- Output: `<race_id>.kp.raw.parquet` — frame, 13 × (x, y, conf).
- Teaching notes: top-down pose = detect, crop, estimate. RTMPose is SimCC-style (x and y as separate 1-D classifications), fast and blur-robust. Model confidence is not visibility; `vis` is derived in 2.2.

### 2.2 [CLAUDE] Temporal smoothing and visibility
- Depends on: 2.1
- Actions: `swimtech/smooth.py`: per-keypoint Savitzky–Golay (window 9, order 3) on frames with conf ≥ 0.3; linear interpolation across gaps ≤ 12 frames (0.2 s); longer gaps stay NaN. `vis` = 2 if conf ≥ 0.5, 1 if interpolated, 0 if NaN. Optionally SmoothNet if its license checks out.
- Output: `<race_id>.kp.parquet`.
- Teaching notes: Savitzky–Golay keeps real peaks; a moving average would blunt the wrist turnaround and shift every angle sample. The 12-frame limit is deliberate: longer gaps are genuinely unknown.

### 2.3 [CLAUDE] Cycle and phase segmentation
- Depends on: 2.2
- Actions: `swimtech/cycles.py`: per wrist, vertical-position signal, band-pass 0.5–2.5 Hz, `scipy.signal.find_peaks` (min distance 0.5 s); entry = local minimum after a peak coinciding with the wrist crossing the shoulder line forward; exit = preceding minimum near the hip; mid-recovery = the peak. Breath = head-yaw proxy (ear-to-ear distance ratio) over threshold for ≥ 4 frames. Length boundaries from direction reversal in track x.
- Output: the `cycles` array with per-cycle frame indices for each instant.
- Teaching notes: pure signal processing, inspectable; a learned phase model (TCN) only when Stage 3 labels exist.

### 2.4 [CLAUDE] Angle and rhythm metrics
- Depends on: 0.2, 1.5, 2.3
- Actions: implement each registry stub; sample at the 2.3 instants; rectify `_rect` metrics via 1.5; attach `vis`; aggregate per cycle → per length → per race; L/R asymmetry as signed difference; fit a slope across the race for fatigue drift.
- Output: `metrics` array plus `summary` block.
- Teaching notes: metrics as pure functions `f(keypoints_at_instant, calib) -> value`; adding a metric is one function and one registry line. Asymmetry is signed so a consistent drop shows as a trend.

### 2.5 [CLAUDE] Findings generator (rules)
- Depends on: 2.4
- Actions: `swimtech/findings.py`: flag race slope over threshold, L/R asymmetry over threshold, breath-side bias, cycle-variability spikes; rank by magnitude × visibility; cap at 8; each names the frame where most visible.
- Output: `findings` array.
- Teaching notes: rules first, LLM later (7.4). An LLM is for wording, not detection.

### 2.6 [CLAUDE] Annotated video renderer
- Depends on: 2.4
- Actions: `swimtech/render.py`: skeleton (grey when `vis` < 2), three angle readouts at each sampled instant, cycle counters, finding markers; encode at source resolution via ffmpeg piping; thumbnail.
- Output: `<race_id>.annot.mp4`, `<race_id>.jpg`.
- Teaching notes: rendered server-side once; the Vue overlay (4.3) draws the same data live for scrubbing; the baked video is for sharing.

### 2.7 [CLAUDE] Pipeline runner and FastAPI service
- Depends on: 2.5, 2.6
- Actions: `swimtech/run.py` chaining stages with caching. `api/main.py`: `POST /races`, `POST /races/{id}/process`, `GET /races/{id}`, `GET /races/{id}/media/{kind}`, `PATCH /races/{id}/keypoints`. Local dev runs in-process; 5.2 moves processing to a GPU worker.
- Output: running local API; OpenAPI docs at `/docs`; `results.schema.json` the Vue client validates against.
- Teaching notes: the API is thin; every computation lives in `swimtech/`, which the tests cover.

### 2.8 [YOU] End-to-end review of your first race
- Depends on: 2.7
- Actions: `uv run swimtech run clip.MOV --race-id test1 --lane 4 --stroke free`. Watch `test1.annot.mp4` at 0.25x for two lengths. Note: skeleton on wrong limb, wrist jumping, obviously wrong angles, cycles missed/doubled, nonsense findings. Timestamps are enough.
- Output: observations + `test1.results.json`. ~1 h. The most valuable hour in the plan; find the top three failure modes.

## Stage 3 — Evaluate, then fine-tune only if needed

Tasks 3.3–3.6 run only if 3.1 says so.

### 3.1 [CLAUDE] Evaluation report
- Depends on: 2.8
- Actions: `scripts/eval_pose.py`: fraction of frames with wrist `vis` = 2, elbow/wrist confidence histograms, cycle-detection rate vs a manual count for two lengths, a "flicker" score. Write `docs/eval_v1.md` with go/no-go against fixed thresholds (wrist visible ≥ 75% of surface frames, cycle recall ≥ 95%).
- Teaching notes: confident, stable frame-to-frame, and periodic usually means right.

### 3.2 [CLAUDE] Prelabel tool and CVAT project
- Depends on: 3.1 (go)
- Actions: `scripts/prelabel.py`: 1,000 frames by stratified sampling; run the current model; CVAT XML with the 13-point skeleton and `vis`. CVAT project config, Docker one-liner, 10-minute labeling guide.
- Output: `labels/cvat_project.json`, `labels/prelabeled.xml`, `docs/labeling.md`.

### 3.3 [YOU] Correct the prelabeled frames
- Depends on: 3.2
- Actions: run CVAT, import, drag misplaced points, set `vis`; skip hopeless frames. Export CVAT XML.
- Output: `labels/corrected.xml`. ~a weekend at 15 s/frame. If too much, do 500 first.

### 3.4 [CLAUDE] Training script
- Depends on: 3.3
- Actions: CVAT XML → COCO keypoints; MMPose config inheriting RTMPose-l with 13-point head; augmentations (random erase, brightness/glare jitter, motion blur, flip with L/R swap); split by race; 60 epochs; log PCK@0.05 per keypoint; export ONNX. `bash scripts/train.sh`.
- Output: `configs/rtmpose_swim13.py`, `scripts/train.sh`, RunPod/Modal launch file.

### 3.5 [YOU] Run training on a cloud GPU
- Depends on: 3.4
- Actions: RunPod or Modal account, $10 credit, run the template, `bash scripts/train.sh`, ~1–2 h on A10/L4, send `work_dirs/latest.onnx` and `metrics.json`. If you have an NVIDIA GPU ≥ 12 GB, run locally.
- Output: ONNX model + metrics. ~30 min attention; $3–6 GPU.

### 3.6 [CLAUDE] Swap the model in and re-evaluate
- Depends on: 3.5
- Actions: point `pose.py` at the new ONNX behind a config flag; rerun 3.1 on the same clips; `docs/eval_v2.md`; keep whichever wins per keypoint.

## Stage 4 — Vue front end

Goal: the existing design wired to real data. Can start in parallel with Stage 2 against a sample `results.json`.

### 4.1 [CLAUDE] API client and Pinia stores
- Depends on: 0.4, 2.7 (schema)
- Actions: `src/api/client.ts` (fetch wrapper, auth header, typed endpoints from OpenAPI via `openapi-typescript`); stores `useRacesStore`, `usePlaybackStore` (currentTime, frame, playing, selected cycle), `useUploadStore`. Load the Parquet sidecar with `parquet-wasm`, or have the API also serve it as JSON for v1.
- Output: the files above plus `src/types/results.ts`.

### 4.2 [CLAUDE] Upload and job status
- Depends on: 4.1
- Actions: `UploadRace.vue`: file picker, lane selector over the first frame, calibration-corner clicker, chunked upload to a signed URL with progress, poll `GET /races/{id}` every 3 s showing stage names. Shows 1.2 quality warnings.

### 4.3 [CLAUDE] Review player with live overlay
- Depends on: 4.1
- Actions: `ReviewPlayer.vue`: `<video>` + `<canvas>`, `requestVideoFrameCallback` draws keypoints, limbs (grey when `vis` < 2), angle arcs/values, cycle/length markers on a custom scrub bar. Frame-step, 0.25x/0.5x/1x, L/R toggle, metric picker.
- Output: the component plus `src/overlay/draw.ts` (pure drawing functions).

### 4.4 [CLAUDE] Metric charts
- Depends on: 4.1
- Actions: `MetricCharts.vue` with ECharts: per-cycle line (L and R series), length bands, fatigue-slope line, cycle-curve overlay (0–100%, mean ± band). Click seeks the player.

### 4.5 [CLAUDE] Findings and summary
- Depends on: 4.1
- Actions: `RaceSummary.vue`: per-length tiles, findings list with severity and "show me", share/export row (annotated MP4, CSV).

### 4.6 [CLAUDE] Keypoint correction tool
- Depends on: 4.3
- Actions: correction mode on the player: drag a keypoint, set `vis`, mark a cycle bad, `PATCH /races/{id}/keypoints`; backend re-runs 2.2–2.5 for the affected window (± one cycle). Corrections are the active-learning pool for 7.1.

### 4.7 [CLAUDE] Side-by-side comparison
- Depends on: 4.3
- Actions: `CompareView.vue`: two players driven by one store, synced by cycle number, metric curves overlaid.

### 4.8 [YOU] Place the components and review
- Depends on: 4.2–4.7
- Actions: drop each component into its screen, keep your styling, `npm run dev` against the local API or sample data, send screenshots with notes. Test on your phone's browser via LAN.
- Output: screenshots and notes. ~2–3 h over the stage. You own the look.

## Stage 5 — Backend hosting

Expected cost at hobby scale: $5–15/month plus ~$0.05–0.15 per race.

### 5.1 [CLAUDE] Containers
- Depends on: 2.7
- Actions: `Dockerfile.api`, `Dockerfile.worker` (CUDA, ONNX Runtime GPU, ffmpeg), `docker-compose.yml` with MinIO and Postgres. `make dev`.

### 5.2 [CLAUDE] GPU worker on Modal
- Depends on: 5.1
- Actions: `worker/modal_app.py`: L4 GPU, models baked in, 20-minute timeout; downloads race, runs `swimtech.run`, uploads results, updates DB row. Triggered by the API. Idle cost zero. RunPod serverless is the fallback.

### 5.3 [CLAUDE] Storage
- Depends on: 5.1
- Actions: Cloudflare R2; layout `races/<user>/<race_id>/...`; presigned PUT for upload, presigned GET for playback; 90-day lifecycle on raw clips.
- Output: `swimtech/storage.py` and bucket policy.

### 5.4 [CLAUDE] Auth and database
- Depends on: 5.1
- Actions: Supabase: email + Apple + Google sign-in; tables `users`, `swimmers`, `races`, `corrections`; row-level security; API verifies the Supabase JWT. Vue uses `@supabase/supabase-js` for login only.
- Output: `db/schema.sql`, RLS policies, auth middleware.

### 5.5 [CLAUDE] Job queue, retries, monitoring
- Depends on: 5.2, 5.4
- Actions: status machine (`uploaded → queued → processing → done | failed`), one retry on transient failure, failure reason stored, Sentry, `/health`, daily cost readout from Modal.
- Output: status handling plus `docs/ops.md`.

### 5.6 [YOU] Accounts, secrets, deploy
- Depends on: 5.5
- Actions: accounts at Modal, Cloudflare (R2), Supabase, Sentry; fill the `.env` template; `make deploy`; open the health URL; upload one race from your phone browser.
- Output: live API URL and one processed race. ~1 h.

## Stage 6 — App packaging and store release

Codemagic builds iOS so Xcode is touched as little as possible.

### 6.1 [CLAUDE] Capacitor setup
- Depends on: 4.8
- Actions: Capacitor 6; `capacitor.config.ts` with bundle ids; iOS and Android projects committed; status bar, safe area, keyboard; deep link scheme for auth callbacks.
- Output: `ios/`, `android/`, `npm run build:mobile`.

### 6.2 [CLAUDE] File import and background upload
- Depends on: 6.1, 5.3
- Actions: `@capacitor/filesystem` + file picker; chunked resumable upload to presigned URL; iOS background URL session; progress persisted across restart.

### 6.3 [CLAUDE] Push notifications
- Depends on: 6.1, 5.5
- Actions: `@capacitor/push-notifications` with FCM; worker pushes on done/failed; tap opens the race.

### 6.4 [CLAUDE] Icons, splash, privacy manifest, permissions
- Depends on: 6.1
- Actions: icon/splash sets; iOS `PrivacyInfo.xcprivacy`; `Info.plist` photo-library strings; Android permissions and `targetSdk`; no ATT.

### 6.5 [CLAUDE] Codemagic CI
- Depends on: 6.4
- Actions: `codemagic.yaml`: iOS build signed via App Store Connect API key → TestFlight; Android build signed with keystore → Play internal testing; version from git tag.
- Output: config plus `docs/release.md`.

### 6.6 [CLAUDE] Store listing, privacy policy, review notes
- Depends on: 6.4
- Actions: name, subtitle, description, keywords, screenshot plan; hosted privacy policy (video storage, retention, deletion); App Review notes with a demo account and a preloaded race; age rating.
- Output: `store/` folder plus policy URL.

### 6.7 [YOU] Developer accounts and signing
- Depends on: nothing (start early)
- Actions: Apple Developer Program ($99/yr), Google Play Console ($25); App Store Connect API key and Android upload keystore; put them in Codemagic secure vars; Codemagic account connected to the repo.
- Output: both accounts active. ~1–2 h over a few days.

### 6.8 [YOU] Device testing
- Depends on: 6.5
- Actions: install TestFlight (and Play internal); film, import, upload, wait for push, review, correct a keypoint, compare, export. Screen-record issues. Do it twice: Wi-Fi, and cellular with the screen locked during upload.
- Output: bug list with recordings. ~2 h plus a meet.

### 6.9 [CLAUDE] Fix the bug list
- Depends on: 6.8
- Actions: fix, re-push, new build; repeat with 6.8 until a race goes through clean.

### 6.10 [YOU] Submit
- Depends on: 6.9, 6.6, 6.7
- Actions: follow the numbered checklist in App Store Connect and Play Console; submit; forward any rejection verbatim.
- Output: live on both stores. ~1 h; expect one rejection round.

## Stage 7 — Improvement loop (after launch)

### 7.1 [CLAUDE] Active learning
- Depends on: 4.6, 3.4
- Actions: nightly job selects lowest-confidence or corrected frames, exports a prelabeled CVAT batch; retraining reuses 3.4; model registry tracks which version processed each race.

### 7.2 [YOU] Periodic correction batches
- Depends on: 7.1
- Actions: every few weeks, correct ~100 queued frames. ~30 min each.

### 7.3 [CLAUDE] Per-swimmer baselines
- Depends on: 5.4
- Actions: per swimmer and metric, a rolling distribution over the last N races; findings compare to it; Compare view defaults to their best-rated race.

### 7.4 [CLAUDE] Plain-language findings
- Depends on: 2.5, 7.3
- Actions: an Anthropic API call that receives only the metrics table and rule-based findings and writes 3–5 sentences with frame references; rules decide what is flagged; cached per race.

### 7.5 [CLAUDE] Second camera (deck-level side view)
- Depends on: 2.4
- Actions: accept a second clip; sync by start flash/beep; same pipeline with ankles; sagittal metrics; player switches angle.

### 7.6 [CLAUDE] Other strokes
- Depends on: 2.3
- Actions: butterfly, breaststroke, backstroke cycle definitions and metrics; same pipeline, different segmentation rules and instants.

## Dependencies and tally

Stages 1 and 2 are the critical path. Stage 4 starts as soon as the repo and a sample results file exist; Stage 5 as soon as the API exists. Stage 3 runs only if 3.1 says pretrained pose isn't good enough.

Yan's 12 tasks, in order:

- [ ] 0.3 Film and send clips — 2 h at a meet
- [x] 0.4 Repo handoff — done (this repo)
- [ ] 0.2 Spec sign-off — 30 min
- [ ] 1.6 Run Stage 1 on one clip — 30 min
- [ ] 2.8 Review first annotated race — 1 h
- [ ] 3.3 Correct prelabeled frames — a weekend, only if needed
- [ ] 3.5 Run training on a cloud GPU — 30 min, only if needed
- [ ] 4.8 Place components, send screenshots — 2–3 h
- [ ] 5.6 Accounts, secrets, deploy — 1 h
- [ ] 6.7 Developer accounts and signing — 1–2 h, start early
- [ ] 6.8 Device testing — 2 h plus a meet
- [ ] 6.10 Submit — 1 h

About 12–15 hours of attention end to end, plus the optional labeling weekend. Start with 0.3 and 6.7 this week; everything else waits on footage.

## Open issues found on review (2026-10-12)

Decisions needed or gaps to close; none change the stage order.

1. **Camera geometry vs. cycle detection (2.3).** The plan says wrists trace a near-sinusoid "seen from above", but the stands give an oblique view. Image-vertical mixes arm lift with position along the lane. Use wrist position relative to the shoulder line (perpendicular distance) instead of raw image y, and verify on the first clip before trusting cycle counts.
2. **Near-side vs far-side arm confound (2.4).** On alternate lengths the swimmer faces toward and away from the camera, so the arm nearest the camera swaps. L/R asymmetry must be computed within same-direction lengths, or the asymmetry metric will mostly measure camera side. Needs a rule in `docs/metrics.md`.
3. **Technique list mismatch.** The app's upload screen offers backstroke, breaststroke, butterfly, open turn, flip turn and dive. v1 covers freestyle only; turns and dives are underwater phases the detector is expected to miss. Either hide the other options in v1 or label them "coming soon".
4. **Chat composer has no backend.** The analysis screen has an "Ask a question" box. The plan only has one-shot LLM wording (7.4), not Q&A. Either drop the composer from v1 or add a task: `POST /races/{id}/ask`, grounded on the metrics table only, with per-race rate limits.
5. **Front-end stack assumptions.** The plan assumes TypeScript and Pinia; this repo is plain JS with a reactive module store. Decide before 4.1: add TS + Pinia (recommended, small repo, cheap now), or write 4.x in JS and drop the OpenAPI type generation.
6. **Web deployment is unaccounted for.** The Vue app is live on Netlify. Stages 5 and 6 cover the API and native shells but not the web build: API base URL per environment, CORS on the API, and whether the Netlify site stays as the web client. One line in 5.5 or 6.1.
7. **Calibration clip is optional in practice.** If a user skips the empty-lane clip, every `_rect` metric is unavailable. The pipeline needs an explicit fallback (image-space only, `_rect` metrics omitted with a warning in the UI), and 1.5 should allow clicking lane corners on the race's first frame as a second-best option.
8. **Consent and minors.** Meet footage includes other swimmers, often minors. The privacy policy (6.6) covers storage but not bystanders, and 7.1 uses user corrections for training. Terms need: user asserts they have the right to film, other lanes are cropped out of stored derivatives where possible, and training on corrections is opt-in or disclosed.
9. **Retention is only defined for raw clips.** The 90-day rule covers raw uploads; normalized video, crop video and annotated video are not covered. State a retention for each, and a user-initiated delete that removes all derivatives.
10. **Unused dependencies in the license list.** SAM 2 and MotionBERT are listed as approved but no task uses them. Harmless, but remove them or name the task so the list stays trustworthy.
11. **Sample results file for Stage 4 has no task.** Stage 4 is meant to start against a sample `results.json` before Stage 2 finishes, but nothing produces it. Add it to 0.1 (hand-written sample alongside the spec) so the front end can start the day the spec is signed off.
12. **Pose on the crop ignores lane-mates in the crop.** A crop 1.6× the swimmer's height will often include a neighbor's arm. RTMPose top-down returns one person per crop and may lock onto the wrong one. 2.1 should pick the instance whose hip center is closest to the tracked box center, not the highest-scoring one.
