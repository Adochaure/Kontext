"use client";

/* Three's declarations are bridged locally until @types/three is available. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Navbar from "./Navbar";
type Page3Props = {
  modelUrl?: string;
};

const DEFAULT_MODEL_URL = "/stamp.glb";

type SphereLogoConfig = {
  meshName: string;
  bgColor: string;
  logoColor: string;
  logoTitle: string;
  pathData: string;
};

const SPHERE_LOGOS: SphereLogoConfig[] = [
  {
    meshName: "Sphere_1",
    bgColor: "#EC4920", // Red
    logoColor: "#FFFFFF", // White
    logoTitle: "ChatGPT",
    pathData:
      "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1638a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.686zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  {
    meshName: "Sphere_2",
    bgColor: "#9E9898", // Gray
    logoColor: "#000000", // Black
    logoTitle: "Claude",
    pathData:
      "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
  },
  {
    meshName: "Sphere_3",
    bgColor: "#EC4920", // Red
    logoColor: "#FFFFFF", // White
    logoTitle: "Gemini",
    pathData:
      "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
  {
    meshName: "Sphere_4",
    bgColor: "#9E9898", // Gray
    logoColor: "#000000", // Black
    logoTitle: "Perplexity",
    pathData:
      "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z",
  },
  {
    meshName: "Sphere_5",
    bgColor: "#EC4920", // Red
    logoColor: "#FFFFFF", // White
    logoTitle: "Grok",
    pathData:
      "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    meshName: "Sphere_6",
    bgColor: "#9E9898", // Gray
    logoColor: "#000000", // Black
    logoTitle: "Qwen",
    pathData:
      "M23.919 14.545 20.817 9.17l1.47-2.544a.56.56 0 0 0 0-.566l-1.633-2.83a.57.57 0 0 0-.49-.283h-6.207L12.487.402a.57.57 0 0 0-.49-.284H8.732a.56.56 0 0 0-.49.284L5.139 5.775h-2.94a.56.56 0 0 0-.49.284L.077 8.887a.56.56 0 0 0 0 .567L3.18 14.83l-1.47 2.545a.56.56 0 0 0 0 .566l1.634 2.83a.57.57 0 0 0 .49.283h6.205l1.47 2.545a.57.57 0 0 0 .49.284h3.266a.57.57 0 0 0 .49-.284l3.104-5.375h2.94a.57.57 0 0 0 .49-.283l1.634-2.828a.55.55 0 0 0-.004-.568M8.733.686l1.634 2.828-1.634 2.828H21.8L20.164 9.17H7.425L5.63 6.06Zm1.306 19.801-6.205-.002 1.634-2.83h3.265L2.201 6.344h3.267q3.182 5.517 6.367 11.032zm10.124-5.66L18.53 12l-6.532 11.315-1.634-2.83c2.129-3.673 4.25-7.351 6.373-11.028h3.592l3.102 5.374z",
  },
  {
    meshName: "Sphere_7",
    bgColor: "#EC4920", // Red
    logoColor: "#FFFFFF", // White
    logoTitle: "DeepSeek",
    pathData:
      "M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45",
  },
  {
    meshName: "Sphere_8",
    bgColor: "#9E9898", // Gray
    logoColor: "#000000", // Black
    logoTitle: "Meta",
    pathData:
      "M18.847 2.25c-2.457 0-4.67 1.34-5.847 3.352-1.177-2.012-3.39-3.352-5.847-3.352C3.18 2.25 0 5.43 0 9.35c0 5.098 5.753 9.775 11.233 12.186a1.95 1.95 0 0 0 1.534 0C18.247 19.125 24 14.448 24 9.35c0-3.92-3.18-7.1-7.153-7.1zm-11.7 12.55C4.793 14.8 2.5 12.35 2.5 9.35c0-2.54 2.06-4.6 4.6-4.6 2.05 0 3.82 1.35 4.39 3.32-.4 1.25-1.18 2.76-2.34 4.38-1.02 1.4-1.63 2.02-2.003 2.35zm9.7 0c-.373-.33-.983-.95-2.003-2.35-1.16-1.62-1.94-3.13-2.34-4.38.57-1.97 2.34-3.32 4.39-3.32 2.54 0 4.6 2.06 4.6 4.6 0 3-2.293 5.45-4.647 5.45z",
  },
  {
    meshName: "Sphere_9",
    bgColor: "#EC4920", // Red
    logoColor: "#FFFFFF", // White
    logoTitle: "Copilot",
    pathData:
      "M19.467 6.136a9.07 9.07 0 0 0-4.05-2.072 13.92 13.92 0 0 0-6.834 0 9.07 9.07 0 0 0-4.05 2.072A5.94 5.94 0 0 0 2 10.748v.5c0 2.553 1.583 4.795 3.868 5.602a6.002 6.002 0 0 0 3.754 1.936v.928a.5.5 0 0 0 .5.5h3.756a.5.5 0 0 0 .5-.5v-.928a6.002 6.002 0 0 0 3.754-1.936A6.02 6.02 0 0 0 22 11.248v-.5a5.94 5.94 0 0 0-2.533-4.612zm-12.09 6.273a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9.246 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
  },
  {
    meshName: "Sphere_10",
    bgColor: "#9E9898", // Gray
    logoColor: "#000000", // Black
    logoTitle: "Mistral",
    pathData:
      "M3.429 3.429h3.428v3.428H3.429zm13.714 0h3.428v3.428h-3.428zm-13.714 3.428h6.857v3.429H3.429zm10.286 0h6.857v3.429h-6.857zm-10.286 3.429h17.143v3.428H3.429zm0 3.428h3.428v3.429H3.429zm6.857 0h6.857v3.429h-6.857zm10.286 0h3.428v3.429h-3.428zm-17.143 3.429h3.428v3.428H3.429zm6.857 0h6.857v3.428h-6.857zm10.286 0h3.428v3.428h-3.428z",
  },
];

function createSphereLogoTexture(
  config: SphereLogoConfig,
  canvasSize: number = 1024,
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) return null;

  // Fill sphere background color (Red #EC4920 or Gray #9E9898)
  ctx.fillStyle = config.bgColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Logo size proportional to canvas size (280px on 1024, 140px on 512)
  const logoSize = Math.round(canvasSize * 0.273);
  const scale = logoSize / 24;

  const drawLogo = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-12, -12); // Center of 24x24 viewBox to (0, 0)
    ctx.fillStyle = config.logoColor;
    ctx.fill(new Path2D(config.pathData));
    ctx.restore();
  };

  // Front face of sphere (centered at u = 0.25, v = 0.50)
  drawLogo(canvasSize * 0.25, canvasSize * 0.5);

  // Back face of sphere (centered at u = 0.75, v = 0.50)
  drawLogo(canvasSize * 0.75, canvasSize * 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = canvasSize > 512 ? 4 : 2;
  texture.needsUpdate = true;
  return texture;
}

function createSubheadingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2560;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.font = '400 56px "Hanken Grotesk", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Import your conversations and continue them with any AI, effortlessly.",
    canvas.width / 2,
    canvas.height / 2,
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = 3;
  texture.needsUpdate = true;
  return texture;
}

function createHeadingTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 3072;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.font = '700 180px "Hanken Grotesk", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function Page3({ modelUrl = DEFAULT_MODEL_URL }: Page3Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const distanceLabelRef = useRef<HTMLSpanElement>(null);
  const speedLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile device and low-power detection
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ));

    const canvasSize = isMobile ? 512 : 1024;
    // Cap pixel ratio to 1.5 on mobile to avoid fillrate throttling on 3x/4x mobile displays
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0.55, 2.229);
    camera.lookAt(0, 0.2, 0);

    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        // Disable expensive hardware 4x MSAA on mobile high-DPI screens for locked 60/120fps
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const ambientLight = new THREE.HemisphereLight("#ffffff", "#17205f", 3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#ffffff", 2.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight("#ffcf8a", 6, 12);
    fillLight.position.set(-4, 1, 3);
    scene.add(fillLight);

    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    const subheadingTexture = createSubheadingTexture();
    const subheadingArc = subheadingTexture
      ? new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.85,
            0.85,
            0.2375,
            128,
            1,
            true,
            0,
            Math.PI * 2,
          ),
          new THREE.MeshBasicMaterial({
            map: subheadingTexture,
            transparent: true,
            depthWrite: false,
            side: THREE.FrontSide,
          }),
        )
      : null;

    if (subheadingArc) {
      subheadingArc.position.set(0, 0.44, 0.25);
      scene.add(subheadingArc);
    }

    const headingTextures = [
      createHeadingTexture("YOUR CONVERSATIONS."),
      createHeadingTexture("YOUR CONTEXT. ANY AI."),
    ];
    const headingArcs = headingTextures.flatMap((texture, index) => {
      if (!texture) return [];

      const arc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 0.37, 96, 1, true, -0.85, 1.7),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
        }),
      );
      // Keep the two headline lines visually tight as one statement.
      arc.position.set(0, index === 0 ? 0.65 : 0.54, 0.1);
      scene.add(arc);
      return [arc];
    });

    // Keep the curved type readable and the model in frame on narrow portrait
    // screens, while retaining the desktop composition on larger displays.
    const updateResponsiveScene = (width: number) => {
      const isPhone = width < 640;
      const isTablet = width >= 640 && width < 1024;

      camera.fov = isPhone ? 62 : isTablet ? 64 : 60;
      camera.position.set(0, isPhone ? 0.45 : 0.55, isPhone ? 2.55 : 2.229);
      camera.lookAt(0, isPhone ? 0.18 : 0.2, 0);

      const headlineScale = isPhone ? 0.72 : isTablet ? 0.88 : 1;
      headingArcs.forEach((arc, index) => {
        arc.scale.setScalar(headlineScale);
        arc.position.set(
          0,
          isPhone ? (index === 0 ? 0.8 : 0.66) : index === 0 ? 0.65 : 0.54,
          0.1,
        );
      });

      if (subheadingArc) {
        subheadingArc.scale.setScalar(isPhone ? 0.72 : isTablet ? 0.88 : 1);
        subheadingArc.position.set(0, isPhone ? 0.56 : 0.44, 0.25);
      }

      camera.updateProjectionMatrix();
    };

    let isDraggingCaption = false;
    let lastPointerX = 0;
    const captionRaycaster = new THREE.Raycaster();
    const captionPointer = new THREE.Vector2();
    const isOverCaption = (event: PointerEvent) => {
      if (!subheadingArc) return false;

      const rect = canvas.getBoundingClientRect();
      captionPointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      captionRaycaster.setFromCamera(captionPointer, camera);
      return captionRaycaster.intersectObject(subheadingArc, false).length > 0;
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOverCaption(event)) return;
      isDraggingCaption = true;
      lastPointerX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingCaption) {
        canvas.style.cursor = isOverCaption(event) ? "grab" : "default";
        return;
      }
      if (!subheadingArc) return;
      subheadingArc.rotation.y += (event.clientX - lastPointerX) * 0.012;
      lastPointerX = event.clientX;
    };
    const handlePointerUp = (event: PointerEvent) => {
      isDraggingCaption = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      canvas.style.cursor = "default";
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    const clock = new THREE.Clock();
    let mixer: any = null;
    const sphereTextures: any[] = [];
    const sphereMeshes: any[] = [];

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: any) => {
        const model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const largestSide = Math.max(size.x, size.y, size.z) || 1;
        // Give the model more presence on phone screens without changing the
        // desktop composition.
        const displaySize = isMobile ? 1.95 : 1.6;
        const scale = displaySize / largestSide;

        model.scale.setScalar(scale);
        // Anchor model completely static at the bottom-left of the screen
        model.position.set(
          -center.x * scale - 0.12,
          -center.y * scale - 0.5,
          -center.z * scale,
        );

        modelRoot.add(model);
        modelRoot.updateMatrixWorld(true);

        model.traverse((object: any) => {
          if (object instanceof THREE.Mesh) {
            const sphereConfig = SPHERE_LOGOS.find(
              (cfg) =>
                object.name === cfg.meshName ||
                object.name.startsWith(`${cfg.meshName}.`) ||
                object.name.startsWith(`${cfg.meshName}_`),
            );
            if (!sphereConfig) return;

            // Track sphere mesh for camera-facing orientation
            sphereMeshes.push(object);

            const logoTexture = createSphereLogoTexture(sphereConfig, canvasSize);
            if (!logoTexture) return;

            sphereTextures.push(logoTexture);
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.forEach((material: any) => {
              material.map = logoTexture;
              material.color?.set("#ffffff");
              material.roughness = 0.28;
              material.metalness = 0.15;
              material.needsUpdate = true;
            });
          }
        });

        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip: any) => {
            mixer.clipAction(clip).play();
          });
        }
      },
      undefined,
      (error: unknown) => {
        console.warn(`Unable to load GLB at ${modelUrl}`, error);
      },
    );

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      updateResponsiveScene(width);
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    // Scroll tracking for kinetic dynamic rotation acceleration
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let scrollVelocity = 0;
    let currentSpeed = 1.0;
    let lastSpeedText = "";

    const handleScroll = () => {
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY;
      lastScrollY = currentY;
      scrollVelocity = Math.abs(dy);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Set initial distance label once
    if (distanceLabelRef.current) {
      distanceLabelRef.current.textContent = "5.00";
    }

    // Visibility-aware animation loop: Pauses when offscreen to save 100% CPU/GPU/battery on phones
    let isVisible = true;
    let animationFrame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries[0]?.isIntersecting ?? true;
        if (intersecting && !isVisible) {
          isVisible = true;
          lastScrollY = window.scrollY;
          animationFrame = window.requestAnimationFrame(animate);
        } else if (!intersecting && isVisible) {
          isVisible = false;
          if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
          }
        }
      },
      { threshold: 0.05 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const animate = () => {
      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);

      // Smoothly decay scroll velocity
      scrollVelocity *= 0.90;

      // Accelerate orbit rotation speed smoothly when user scrolls
      const targetSpeed = 1.0 + Math.min(scrollVelocity * 0.15, 8.0);
      currentSpeed += (targetSpeed - currentSpeed) * 0.1;

      // Update the GLB animation mixer with the rotation speed
      mixer?.update(delta * currentSpeed);

      if (subheadingArc && !isDraggingCaption) {
        subheadingArc.rotation.y -= delta * 0.35;
      }

      // Keep each sphere's front face oriented directly towards the camera
      // using an allocation-free indexed loop
      const numSpheres = sphereMeshes.length;
      for (let i = 0; i < numSpheres; i++) {
        sphereMeshes[i].lookAt(camera.position);
      }

      // Update speed readout label only when text value changes (prevents DOM thrashing)
      const speedStr = `${currentSpeed.toFixed(1)}x`;
      if (lastSpeedText !== speedStr) {
        lastSpeedText = speedStr;
        if (speedLabelRef.current) {
          speedLabelRef.current.textContent = speedStr;
        }
      }

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handleScroll);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      resizeObserver.disconnect();
      mixer?.stopAllAction();
      renderer.dispose();
      sphereTextures.forEach((texture) => texture.dispose());
      subheadingTexture?.dispose();
      headingTextures.forEach((texture) => texture?.dispose());
      if (subheadingArc) {
        subheadingArc.geometry.dispose();
        (subheadingArc.material as THREE.Material).dispose();
      }
      headingArcs.forEach((arc) => {
        arc.geometry.dispose();
        (arc.material as THREE.Material).dispose();
      });
      modelRoot.traverse((object: any) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material: any) => material.dispose());
      });
    };
  }, [modelUrl]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#c8bfba] text-black select-none [contain:layout_style]"
    >
      <Navbar logoSrc="/logo.png" />
      {/* Background SVG Curve & Hourglass Graphic with Glowing Flowing Sphere Gradients */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [contain:strict]"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1729 1156"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft, calm, elegant glow filter */}
            <filter id="svgSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.0" />
            </filter>

            {/* Sphere Gradient 1: Soft warm fiery amber to gold and white */}
            <linearGradient id="sphereFlowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5A1B09" stopOpacity="0" />
              <stop offset="20%" stopColor="#5A1B09" stopOpacity="0.6" />
              <stop offset="42%" stopColor="#EC4920" />
              <stop offset="60%" stopColor="#ffcf8a" />
              <stop offset="72%" stopColor="#ffffff" />
              <stop offset="84%" stopColor="#ffcf8a" />
              <stop offset="94%" stopColor="#EC4920" />
              <stop offset="100%" stopColor="#5A1B09" stopOpacity="0" />
            </linearGradient>

            {/* Sphere Gradient 2 (Reverse Angle) */}
            <linearGradient id="sphereFlowGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#5A1B09" stopOpacity="0" />
              <stop offset="22%" stopColor="#EC4920" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#ffcf8a" />
              <stop offset="90%" stopColor="#EC4920" />
              <stop offset="100%" stopColor="#5A1B09" stopOpacity="0" />
            </linearGradient>

            {/* Sphere Gradient 3 (Vertical Gradient) */}
            <linearGradient id="sphereFlowGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5A1B09" stopOpacity="0" />
              <stop offset="28%" stopColor="#EC4920" />
              <stop offset="52%" stopColor="#ffffff" />
              <stop offset="74%" stopColor="#ffcf8a" />
              <stop offset="100%" stopColor="#5A1B09" stopOpacity="0" />
            </linearGradient>

            {/* Soft red corner-orb glow */}
            <radialGradient id="cornerRedOrb" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fff4ed" stopOpacity="0.9" />
              <stop offset="16%" stopColor="#ffb398" stopOpacity="0.8" />
              <stop offset="43%" stopColor="#ec4920" stopOpacity="0.62" />
              <stop offset="72%" stopColor="#a52512" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#5a1b09" stopOpacity="0" />
            </radialGradient>
            <filter id="cornerOrbBlur" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="34" />
            </filter>

            <style>{`
              @keyframes flowTop1 {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -3400; }
              }
              @keyframes flowTop2 {
                0% { stroke-dashoffset: 1800; }
                100% { stroke-dashoffset: -1600; }
              }
              @keyframes flowBottom1 {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 3500; }
              }
              @keyframes flowBottom2 {
                0% { stroke-dashoffset: -1600; }
                100% { stroke-dashoffset: 1900; }
              }
              @keyframes flowVert1 {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -2800; }
              }
              @keyframes flowVert2 {
                0% { stroke-dashoffset: 2200; }
                100% { stroke-dashoffset: -600; }
              }
              @keyframes calmPulse {
                0%, 100% { opacity: 0.60; }
                50% { opacity: 0.88; }
              }
              .flow-top-1 {
                stroke-dasharray: 420 1600;
                animation: flowTop1 14s linear infinite, calmPulse 5.5s ease-in-out infinite;
              }
              .flow-top-2 {
                stroke-dasharray: 260 1900;
                animation: flowTop2 22s linear infinite reverse;
              }
              .flow-bottom-1 {
                stroke-dasharray: 450 1550;
                animation: flowBottom1 17s linear infinite, calmPulse 6.2s ease-in-out infinite;
              }
              .flow-bottom-2 {
                stroke-dasharray: 300 1800;
                animation: flowBottom2 25s linear infinite reverse;
              }
              .flow-vert-1 {
                stroke-dasharray: 400 1400;
                animation: flowVert1 16s linear infinite, calmPulse 5.0s ease-in-out infinite;
              }
              .flow-vert-2 {
                stroke-dasharray: 320 1500;
                animation: flowVert2 21s linear infinite reverse;
              }
              @media (max-width: 768px) {
                .glow-path {
                  filter: none !important;
                }
              }
            `}</style>
          </defs>

          {/* Atmospheric red orbs in opposite corners */}
          <circle
            cx="70"
            cy="80"
            r="270"
            fill="url(#cornerRedOrb)"
            filter="url(#cornerOrbBlur)"
            opacity="0.78"
          />
          <circle
            cx="1655"
            cy="1080"
            r="300"
            fill="url(#cornerRedOrb)"
            filter="url(#cornerOrbBlur)"
            opacity="0.72"
          />

          {/* Subtle static guide paths */}
          <path
            d="M0.442261 17C0.442261 17 227.203 459 853.419 459C1479.63 459 1728.44 17 1728.44 17"
            stroke="#111111"
            strokeWidth="0.5"
            opacity="0.22"
          />
          <path
            d="M1728.44 1134C1728.44 1134 1501.68 715 875.466 715C249.25 715 0.442253 1134 0.442253 1134"
            stroke="#111111"
            strokeWidth="0.5"
            opacity="0.22"
          />

          {/* Flowing animated paths */}
          <path
            d="M0.442261 17C0.442261 17 227.203 459 853.419 459C1479.63 459 1728.44 17 1728.44 17"
            stroke="url(#sphereFlowGrad1)"
            strokeWidth="2.0"
            strokeLinecap="round"
            className="flow-top-1 glow-path"
            filter="url(#svgSoftGlow)"
            opacity="0.45"
          />
          <path
            d="M0.442261 17C0.442261 17 227.203 459 853.419 459C1479.63 459 1728.44 17 1728.44 17"
            stroke="url(#sphereFlowGrad1)"
            strokeWidth="0.85"
            strokeLinecap="round"
            className="flow-top-1"
          />
          <path
            d="M0.442261 17C0.442261 17 227.203 459 853.419 459C1479.63 459 1728.44 17 1728.44 17"
            stroke="url(#sphereFlowGrad2)"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="flow-top-2"
          />

          <path
            d="M1728.44 1134C1728.44 1134 1501.68 715 875.466 715C249.25 715 0.442253 1134 0.442253 1134"
            stroke="url(#sphereFlowGrad2)"
            strokeWidth="2.0"
            strokeLinecap="round"
            className="flow-bottom-1 glow-path"
            filter="url(#svgSoftGlow)"
            opacity="0.45"
          />
          <path
            d="M1728.44 1134C1728.44 1134 1501.68 715 875.466 715C249.25 715 0.442253 1134 0.442253 1134"
            stroke="url(#sphereFlowGrad2)"
            strokeWidth="0.85"
            strokeLinecap="round"
            className="flow-bottom-1"
          />
          <path
            d="M1728.44 1134C1728.44 1134 1501.68 715 875.466 715C249.25 715 0.442253 1134 0.442253 1134"
            stroke="url(#sphereFlowGrad1)"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="flow-bottom-2"
          />

          {/* Hourglass central curves */}
          <path
            d="M675.079 7.0845L674.645 7.33246C811.287 246.391 868.992 427.239 861.469 600.532C853.947 773.832 781.19 939.655 656.73 1148.67L657.159 1148.93L657.589 1149.18C782.068 940.135 854.935 774.133 862.468 600.575C870.002 427.011 812.197 245.968 675.513 6.83654L675.079 7.0845ZM1071.61 7.02279L1071.16 6.80545C958.164 241.179 904.797 420.088 904.137 593.754C903.476 767.421 955.522 935.787 1053.24 1149.07L1053.69 1148.86L1054.15 1148.66C956.454 935.421 904.477 767.211 905.137 593.759C905.796 420.306 959.094 241.554 1072.06 7.24013L1071.61 7.02279Z"
            fill="#111111"
            opacity="0.10"
          />
          <path
            d="M675.079 7.0845L674.645 7.33246C811.287 246.391 868.992 427.239 861.469 600.532C853.947 773.832 781.19 939.655 656.73 1148.67L657.159 1148.93L657.589 1149.18C782.068 940.135 854.935 774.133 862.468 600.575C870.002 427.011 812.197 245.968 675.513 6.83654L675.079 7.0845ZM1071.61 7.02279L1071.16 6.80545C958.164 241.179 904.797 420.088 904.137 593.754C903.476 767.421 955.522 935.787 1053.24 1149.07L1053.69 1148.86L1054.15 1148.66C956.454 935.421 904.477 767.211 905.137 593.759C905.796 420.306 959.094 241.554 1072.06 7.24013L1071.61 7.02279Z"
            stroke="url(#sphereFlowGrad3)"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="flow-vert-1 glow-path"
            filter="url(#svgSoftGlow)"
            opacity="0.45"
          />
          <path
            d="M675.079 7.0845L674.645 7.33246C811.287 246.391 868.992 427.239 861.469 600.532C853.947 773.832 781.19 939.655 656.73 1148.67L657.159 1148.93L657.589 1149.18C782.068 940.135 854.935 774.133 862.468 600.575C870.002 427.011 812.197 245.968 675.513 6.83654L675.079 7.0845ZM1071.61 7.02279L1071.16 6.80545C958.164 241.179 904.797 420.088 904.137 593.754C903.476 767.421 955.522 935.787 1053.24 1149.07L1053.69 1148.86L1054.15 1148.66C956.454 935.421 904.477 767.211 905.137 593.759C905.796 420.306 959.094 241.554 1072.06 7.24013L1071.61 7.02279Z"
            stroke="url(#sphereFlowGrad3)"
            strokeWidth="1.0"
            strokeLinecap="round"
            className="flow-vert-1"
          />
          <path
            d="M675.079 7.0845L674.645 7.33246C811.287 246.391 868.992 427.239 861.469 600.532C853.947 773.832 781.19 939.655 656.73 1148.67L657.159 1148.93L657.589 1149.18C782.068 940.135 854.935 774.133 862.468 600.575C870.002 427.011 812.197 245.968 675.513 6.83654L675.079 7.0845ZM1071.61 7.02279L1071.16 6.80545C958.164 241.179 904.797 420.088 904.137 593.754C903.476 767.421 955.522 935.787 1053.24 1149.07L1053.69 1148.86L1054.15 1148.66C956.454 935.421 904.477 767.211 905.137 593.759C905.796 420.306 959.094 241.554 1072.06 7.24013L1071.61 7.02279Z"
            stroke="#ffffff"
            strokeWidth="0.5"
            strokeLinecap="round"
            className="flow-vert-1"
            opacity="0.6"
          />
          <path
            d="M675.079 7.0845L674.645 7.33246C811.287 246.391 868.992 427.239 861.469 600.532C853.947 773.832 781.19 939.655 656.73 1148.67L657.159 1148.93L657.589 1149.18C782.068 940.135 854.935 774.133 862.468 600.575C870.002 427.011 812.197 245.968 675.513 6.83654L675.079 7.0845ZM1071.61 7.02279L1071.16 6.80545C958.164 241.179 904.797 420.088 904.137 593.754C903.476 767.421 955.522 935.787 1053.24 1149.07L1053.69 1148.86L1054.15 1148.66C956.454 935.421 904.477 767.211 905.137 593.759C905.796 420.306 959.094 241.554 1072.06 7.24013L1071.61 7.02279Z"
            stroke="url(#sphereFlowGrad1)"
            strokeWidth="2.0"
            strokeLinecap="round"
            className="flow-vert-2 glow-path"
            filter="url(#svgSoftGlow)"
            opacity="0.45"
          />
          <path
            d="M675.079 7.0845L674.645 7.33246C811.287 246.391 868.992 427.239 861.469 600.532C853.947 773.832 781.19 939.655 656.73 1148.67L657.159 1148.93L657.589 1149.18C782.068 940.135 854.935 774.133 862.468 600.575C870.002 427.011 812.197 245.968 675.513 6.83654L675.079 7.0845ZM1071.61 7.02279L1071.16 6.80545C958.164 241.179 904.797 420.088 904.137 593.754C903.476 767.421 955.522 935.787 1053.24 1149.07L1053.69 1148.86L1054.15 1148.66C956.454 935.421 904.477 767.211 905.137 593.759C905.796 420.306 959.094 241.554 1072.06 7.24013L1071.61 7.02279Z"
            stroke="url(#sphereFlowGrad1)"
            strokeWidth="0.85"
            strokeLinecap="round"
            className="flow-vert-2"
          />
        </svg>
      </div>

      {/* 3D WebGL Canvas (Transparent background, hardware-accelerated, touch-pass-through) */}
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D model viewer"
        className="absolute inset-0 h-full w-full [contain:strict]"
        style={{ touchAction: "pan-y" }}
      />

    </section>
  );
}
