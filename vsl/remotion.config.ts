// Réglages du rendu Remotion (studio et ligne de commande).
// Navigateur : Chromium local (variable REMOTION_CHROME pour en changer).
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCE ?? 2));
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
Config.setOverwriteOutput(true);
