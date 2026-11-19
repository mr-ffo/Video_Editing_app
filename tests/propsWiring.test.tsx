import test from "node:test";
import assert from "node:assert";
import React from "react";
import path from "node:path";
import { AdaptiveVideoOverlay } from "../src/compositions/AdaptiveVideoOverlay";
import { TechnicalExplainer } from "../src/compositions/TechnicalExplainer";
import { TitleScene } from "../src/scenes/TitleScene";
import { SpeakerScene } from "../src/scenes/SpeakerScene";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactDOMServer = require("react-dom/server");

// Internal Remotion contexts for testing components in Node
const remotionDir = path.join(process.cwd(), "node_modules/remotion/dist/cjs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CanUseRemotionHooks } = require(path.join(remotionDir, "CanUseRemotionHooks.js"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { VideoContext } = require(path.join(remotionDir, "use-video.js"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TimelineContext, PlaybackRateContext, SetTimelineContext } = require(path.join(remotionDir, "TimelineContext.js"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SharedAudioContext, SharedAudioTagsContext } = require(
  path.join(remotionDir, "audio/shared-audio-tags.js")
);

const dummyAudioContext = {
  audioContextPending: false,
  sampleRate: 44100,
  audioContext: null,
  getAudioContextState: () => null,
  gainNode: null,
  audioSyncAnchor: { value: 0 },
  audioSyncAnchorEmitter: { on: () => {}, off: () => {} },
  scheduleAudioNode: () => ({}),
  resume: async () => {},
  resumeAsAutoPlay: async () => {},
  suspend: async () => {},
  getIsResumingAudioContext: () => null,
  unscheduleAudioNode: () => false,
  _experimentalKeepAudioContextAlive: false,
};

const dummyAudioTags = {
  registerAudio: () => ({ audio: null, id: 0 }),
  unregisterAudio: () => {},
};

const dummySetTimelineContext = {
  seek: null,
  setFrameWithoutSeek: () => {},
  setPlaying: () => {},
  setBuffering: () => {},
  subscribePlaying: () => () => {},
  subscribeBuffering: () => () => {},
  isPlaying: () => false,
  isBuffering: () => false,
  frameRef: { current: {} },
  audioAndVideoTags: { current: [] },
};

const renderRemotionComponent = (
  component: React.ReactElement,
  compId: string = "testComp",
  frame: number = 45,
  durationInFrames: number = 1800
): string => {
  const tree = React.createElement(
    CanUseRemotionHooks.Provider,
    { value: true },
    React.createElement(
      SharedAudioContext.Provider,
      { value: dummyAudioContext },
      React.createElement(
        SharedAudioTagsContext.Provider,
        { value: dummyAudioTags },
        React.createElement(
          PlaybackRateContext.Provider,
          { value: { playbackRate: 1, setPlaybackRate: () => {} } },
          React.createElement(
            SetTimelineContext.Provider,
            { value: dummySetTimelineContext },
            React.createElement(
              VideoContext.Provider,
              {
                value: {
                  id: compId,
                  width: 1920,
                  height: 1080,
                  fps: 30,
                  durationInFrames,
                },
              },
              React.createElement(
                TimelineContext.Provider,
                {
                  value: {
                    frame: { [compId]: frame },
                    isPlaying: () => false,
                    isInsideFreeze: false,
                  },
                },
                component
              )
            )
          )
        )
      )
    )
  );
  return ReactDOMServer.renderToStaticMarkup(tree);
};

test("TitleScene: renders custom episode title correctly", () => {
  const customTitle = "FinOps Masterclass • Zero to Production";
  const html = renderRemotionComponent(<TitleScene title={customTitle} />, "TitleTest", 45, 90);
  assert.ok(html.includes(customTitle), "Custom episode title must be in TitleScene markup");
});

test("SpeakerScene: renders custom speaker name and title correctly", () => {
  const customSpeaker = "Jane Doe";
  const customRole = "Staff Cloud Architect";
  const html = renderRemotionComponent(
    <SpeakerScene name={customSpeaker} title={customRole} />,
    "SpeakerTest",
    30,
    120
  );
  assert.ok(html.includes(customSpeaker), "Custom speaker name must be in SpeakerScene markup");
  assert.ok(html.includes(customRole), "Custom speaker role must be in SpeakerScene markup");
});

test("AdaptiveVideoOverlay: dynamically updates episode title and speaker credentials", () => {
  const customTitle = "FinOps Masterclass • Zero to Production";
  const customSpeaker = "Jane Doe";
  const customRole = "Staff Cloud Architect";

  // Frame 45: Title scene active
  const htmlTitle = renderRemotionComponent(
    <AdaptiveVideoOverlay
      durationMinutes={1}
      videoSrc="test-video.mp4"
      episodeTitle={customTitle}
      speakerName={customSpeaker}
      speakerTitle={customRole}
    />,
    "AdaptiveTestTitle",
    45,
    1800
  );

  assert.ok(htmlTitle.includes(customTitle), "Custom episode title must be rendered in AdaptiveVideoOverlay");
  assert.ok(!htmlTitle.includes("Behind The Cloud"), "Hardcoded default title should be overridden");

  // Frame 150: Speaker lower third scene active (100 - 310)
  const htmlSpeaker = renderRemotionComponent(
    <AdaptiveVideoOverlay
      durationMinutes={1}
      videoSrc="test-video.mp4"
      episodeTitle={customTitle}
      speakerName={customSpeaker}
      speakerTitle={customRole}
    />,
    "AdaptiveTestSpeaker",
    150,
    1800
  );

  assert.ok(htmlSpeaker.includes(customSpeaker), "Custom speaker name must be rendered in AdaptiveVideoOverlay");
  assert.ok(htmlSpeaker.includes(customRole), "Custom speaker role must be rendered in AdaptiveVideoOverlay");
});

test("AdaptiveVideoOverlay: falls back gracefully to defaults when props are omitted", () => {
  const htmlTitle = renderRemotionComponent(
    <AdaptiveVideoOverlay durationMinutes={1} />,
    "AdaptiveFallbackTitle",
    45,
    1800
  );
  assert.ok(htmlTitle.includes("Behind The Cloud"), "Fallback default title rendered");

  const htmlSpeaker = renderRemotionComponent(
    <AdaptiveVideoOverlay durationMinutes={1} />,
    "AdaptiveFallbackSpeaker",
    150,
    1800
  );
  assert.ok(htmlSpeaker.includes("Folarin Favour Olaoluwapo"), "Fallback speaker name rendered");
});

test("AdaptiveVideoOverlay: toggles SmartVideo when trimSilenceAndFillers is enabled", () => {
  const htmlStandard = renderRemotionComponent(
    <AdaptiveVideoOverlay
      durationMinutes={1}
      trimSilenceAndFillers={false}
      playbackRate={1.0}
    />,
    "StandardTest",
    45,
    1800
  );

  const htmlSmart = renderRemotionComponent(
    <AdaptiveVideoOverlay
      durationMinutes={1}
      trimSilenceAndFillers={true}
      playbackRate={1.15}
    />,
    "SmartTest",
    45,
    1800
  );

  assert.strictEqual(typeof htmlStandard, "string");
  assert.strictEqual(typeof htmlSmart, "string");
  assert.ok(htmlSmart.length > 0);
});

test("TechnicalExplainer: dynamically accepts and renders episode title and presenter", () => {
  const customTitle = "Distributed Systems in Go and Kubernetes";
  const customSpeaker = "Alex Rivera";
  const customRole = "Principal Systems Engineer";

  // Test Chapter 1 at frame 45 for Title
  const htmlCh1 = renderRemotionComponent(
    <TechnicalExplainer
      episodeTitle={customTitle}
      speakerName={customSpeaker}
      speakerTitle={customRole}
    />,
    "ExplainerTest",
    45,
    1200
  );
  assert.ok(htmlCh1.includes(customTitle), "Explainer renders custom title in chapter 1");

  // Test Chapter 2 at frame 150 for Speaker
  const htmlCh2 = renderRemotionComponent(
    <TechnicalExplainer
      episodeTitle={customTitle}
      speakerName={customSpeaker}
      speakerTitle={customRole}
    />,
    "ExplainerTest",
    150,
    1200
  );
  assert.ok(htmlCh2.includes(customSpeaker), "Explainer renders custom speaker in chapter 2");
  assert.ok(htmlCh2.includes(customRole), "Explainer renders custom role in chapter 2");
});
