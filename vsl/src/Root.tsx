// Compositions de la VSL SmartFixx (30 images/s). Les durées viennent de vsl/audio/minutage.json.
import React from "react";
import { Composition, Still } from "remotion";
import { FPS, dureeImages } from "./lib/temps";
import { Accroche, Courte, Principale } from "./compositions/Videos";
import { Miniature } from "./compositions/Miniature";

export const Racine: React.FC = () => (
  <>
    <Composition id="principale-9x16" component={Principale} defaultProps={{ vertical: true }} durationInFrames={dureeImages("principale")} fps={FPS} width={1080} height={1920} />
    <Composition id="principale-16x9" component={Principale} defaultProps={{ vertical: false }} durationInFrames={dureeImages("principale")} fps={FPS} width={1920} height={1080} />
    <Composition id="courte-15s-9x16" component={Courte} durationInFrames={dureeImages("courte")} fps={FPS} width={1080} height={1920} />
    <Composition id="accroche-1-9x16" component={Accroche} defaultProps={{ numero: 1 as const }} durationInFrames={dureeImages("accroche-1")} fps={FPS} width={1080} height={1920} />
    <Composition id="accroche-2-9x16" component={Accroche} defaultProps={{ numero: 2 as const }} durationInFrames={dureeImages("accroche-2")} fps={FPS} width={1080} height={1920} />
    <Composition id="accroche-3-9x16" component={Accroche} defaultProps={{ numero: 3 as const }} durationInFrames={dureeImages("accroche-3")} fps={FPS} width={1080} height={1920} />
    {/* Variantes « Reels » : premier plan réduit pour garder libres les 35 % du bas (recommandation Meta) */}
    <Composition id="principale-reels-9x16" component={Principale} defaultProps={{ vertical: true, reels: true }} durationInFrames={dureeImages("principale")} fps={FPS} width={1080} height={1920} />
    <Composition id="courte-15s-reels-9x16" component={Courte} defaultProps={{ reels: true }} durationInFrames={dureeImages("courte")} fps={FPS} width={1080} height={1920} />
    <Composition id="accroche-1-reels-9x16" component={Accroche} defaultProps={{ numero: 1 as const, reels: true }} durationInFrames={dureeImages("accroche-1")} fps={FPS} width={1080} height={1920} />
    <Composition id="accroche-2-reels-9x16" component={Accroche} defaultProps={{ numero: 2 as const, reels: true }} durationInFrames={dureeImages("accroche-2")} fps={FPS} width={1080} height={1920} />
    <Composition id="accroche-3-reels-9x16" component={Accroche} defaultProps={{ numero: 3 as const, reels: true }} durationInFrames={dureeImages("accroche-3")} fps={FPS} width={1080} height={1920} />
    <Still id="miniature-9x16" component={Miniature} defaultProps={{ vertical: true }} width={1080} height={1920} />
    <Still id="miniature-16x9" component={Miniature} defaultProps={{ vertical: false }} width={1920} height={1080} />
  </>
);
